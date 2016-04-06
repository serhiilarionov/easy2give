var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  IvrQueue = mongoose.model('IvrQueue'),
  Sms = require('../../services/sms.js'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  smsQueueReferences = require('../../../config/smsQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  _ = require('lodash'),
  File = require('../../services/file.js'),
  async = require('async'),
  env = process.env.NODE_ENV || 'development';

var ivr = function () {
  /**
   * Send ivr from queue
   * @returns {Promise.<T>}
   */
  var notifyIVR = function() {
    var expirationDate = moment().subtract('3', 'd').format(dateFormats.format);
    var where = {};
    where['secondWave'] = {"$gte": expirationDate};
    //where[waveType] = date;
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
              ivr.event = promise.event;
              ivr.phone = phone;
              new IvrQueue(ivr).saveQ();
            }
          });
        });
      })
  };

  /**
   * Route for ivr sending
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

  return {
    notifyIVR : notifyIVR,
    notifyIVRRoute : notifyIVRRoute
  }

}();

if(env === 'development') {
  router.get('/cron/send/ivr', ivr.notifyIVRRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  ivr: ivr
};