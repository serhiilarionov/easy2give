var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  Sms = require('../../services/sms.js'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  smsQueueReferences = require('../../../config/smsQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  _ = require('lodash'),
  File = require('../../services/file.js'),
  async = require('async'),
  env = process.env.NODE_ENV || 'development';

var send = function () {
  /**
   * Send sms from sms queue
   * @returns {Promise.<T>}
   */
  var sms = function() {
    var where = {};
    where['status'] = smsQueueReferences.wait;
    return SmsQueue
      .where(where)
      .findQ()
      .then(function(smsQueue) {
        var portions = [];
        //array divided into portions
        while (smsQueue.length > 0) {
          portions.push(smsQueue.splice(0, 100));
        }

        //send all the sms by the 100 rows
        async.eachSeries(portions, function (portion) {
          var portionPromises = [];
          portion.forEach(function (item) {
            portionPromises.push(
              Sms.send(item.phone, item.smsText)
                .then(function(response) {
                  if(response.RESULT !== "False") {
                    item.state = response.DESCRIPTION;
                    item.session = response.SESSION;
                    item.status = smsQueueReferences.sentToService;
                    item.save();
                    return {
                      smsModel: item
                    }
                  }
                })
            )
          });

          //handling all responses
          return Promise.each(portionPromises, function(promise) {
            if(promise) {
              return Event.where({
                _id: promise.smsModel.event
              }).findOneQ()
                .then(function(event) {
                  //change the status of event to the wave ended
                  if(promise.smsModel.waveType) {
                    event.eventStatus = (_.invert(eventReferences.eventStatuses))
                      [eventReferences.eventWavesTypes[promise.smsModel.waveType][eventReferences.waveStatus.end]];
                    return event.saveQ();
                  }
                })
            }
          })
          .catch(function(err) {
            File.writeToFile('/error.log', err.message);
          })
        });
      });
  };

  /**
   * Route for sms sending
   * @param req
   * @param res
   * @param next
   */
  var smsRoute = function (req, res, next) {
    sms()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    sms : sms,
    smsRoute : smsRoute
  }

}();

if(env === 'development') {
  router.get('/cron/send/sms', send.smsRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  send: send
};

