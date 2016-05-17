var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  IvrQueue = mongoose.model('IvrQueue'),
  Ivr = require('../../services/ivr.js'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  ivrQueueReferences = require('../../../config/ivrQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  _ = require('lodash'),
  File = require('../../services/file.js'),
  async = require('async'),
  env = process.env.NODE_ENV || 'development';

var ivr = function () {
  /**
   * Create ivr queue
   * @returns {Promise.<T>}
   */
  var notifyIVR = function() {
    var expirationDate = moment().format(dateFormats.format);
    var where = {};
    where['ivrDate'] = expirationDate;
    where['ivrAllowed'] = true;
    where['ivrRecordFile'] = true;
    return Event
      .where(where)
      .findQ()
      .then(function(events) {
        var promises = [];
        var _Contact = new Contact();

        events.forEach(function(event) {
          //change status that IVR started
          event.eventStatus = (_.invert(eventReferences.eventStatuses))
            [eventReferences.eventWavesTypes['IVR'][eventReferences.waveStatus.start]];
          event.save();

          //filter contact. send only for not sent contacts
          promises.push(
            _Contact.getContactForEvent(event)
              .then(function(contacts) {
                return {
                  contacts: contacts,
                  event: event
                };
              })
          );
        });

        return Promise.each(promises, function(promise) {
          promise.contacts.forEach(function(contact) {
            var phone = contact.phone;
            if (phone) {
              var ivr = {};
              ivr.contact = contact.id;
              ivr.event = promise.event.id;
              ivr.phone = phone;
              ivr.status = ivrQueueReferences.wait;
              new IvrQueue(ivr).saveQ();
            }
          });
        });
      })
  };

  /**
   * Send ivr from ivr queue
   * @returns {Promise.<T>|*}
   */
  var send = function() {
    var where = {};
    where['status'] = ivrQueueReferences.wait;
    return IvrQueue
      .where(where)
      .findQ()
      .then(function(ivrQueue) {
        var portions = [];
        //array divided into portions
        while (ivrQueue.length > 0) {
          portions.push(ivrQueue.splice(0, 100));
        }

        //send all the ivr by the 100 rows
        async.eachSeries(portions, function(portion) {
          var portionPromises = [];
          portion.forEach(function(item) {
            portionPromises.push(
              Ivr.send(item.phone, item.contact)
                .then(function(response) {
                  if (response) {
                    item.state = response;
                    item.status = ivrQueueReferences.send;
                    return item.saveQ();
                  }
                })
                .then(function() {
                  return Event.where({
                    _id: item.event
                  }).findOneQ()
                })
                .then(function(event) {
                  //change the status of event to the wave ended
                  if(event) {
                    event.eventStatus = (_.invert(eventReferences.eventStatuses))
                      [eventReferences.eventWavesTypes['IVR'][eventReferences.waveStatus.end]];
                  }
                  return event.saveQ();
                })
            )
          });

          //handling all responses
          return Promise.all(portionPromises);
        });
      });
  };

  /**
   * Route for create ivr queue
   * @param req
   * @param res
   * @param next
   */
  var notifyIVRRoute = function (req, res, next) {
    notifyIVR()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  /**
   * Route for ivr sending
   * @param req
   * @param res
   * @param next
   */
  var sendRoute = function (req, res, next) {
    send()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };


  return {
    notifyIVR : notifyIVR,
    notifyIVRRoute : notifyIVRRoute,
    send: send,
    sendRoute: sendRoute
  }

}();

if(env === 'development') {
  router.get('/cron/notify/ivr', ivr.notifyIVRRoute);
  router.get('/cron/send/ivr', ivr.sendRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  ivr: ivr
};