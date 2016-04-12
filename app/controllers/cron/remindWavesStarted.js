var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  templates = require('../../../config/templates.js'),
  smsQueue = require('../../services/smsQueue.js'),
  _ = require('lodash'),
  env = process.env.NODE_ENV || 'development';

var remindWavesStarted = function () {
  /**
   * Send event status to couple
   * @returns {*|Promise.<T>}
   */
  var sendEventStatus = function(date) {
    var expirationDate = moment(date).add(1, 'd').format(dateFormats.format);

    var where = [];
    var firstWave = {};
    firstWave.firstWave = expirationDate;
    firstWave.smsAllowed = true;
    where.push(firstWave);

    var secondWave = {};
    secondWave.secondWave = expirationDate;
    secondWave.smsAllowed = true;
    where.push(secondWave);

    var callCenter = {};
    callCenter.callCenter = expirationDate;
    callCenter.smsAllowed = true;
    callCenter.callRSVP = true;
    where.push(callCenter);

    return Event.where({$or: where}).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          //check ivrAllowed for initialize variable of checks event status
          var eventStatus = event.ivrAllowed ?
            (_.invert(eventReferences.eventStatuses))['IVR done'] :
            (_.invert(eventReferences.eventStatuses))['Second wave done'];
          //sending alert before starting first wave
          if(event.eventStatus == (_.invert(eventReferences.eventStatuses))['New event']
            && moment(event.firstWave).format(dateFormats.format) == expirationDate) {
            promises.push(smsQueue.sendCoupleSms(event, 'coupleBeforeStartingFirstWave', []));
          }
          //sending alert before starting second wave
          else if(event.eventStatus == (_.invert(eventReferences.eventStatuses))['First wave done']
            && moment(event.secondWave).format(dateFormats.format) == expirationDate) {
            promises.push(smsQueue.sendCoupleSms(event, 'coupleBeforeStartingSecondWave', []));
          }
          //sending alert before starting call center
          else if(event.eventStatus == eventStatus
            && moment(event.callCenter).format(dateFormats.format) == expirationDate) {
            promises.push(smsQueue.sendCoupleSms(event, 'coupleBeforeStartingCallCenter', []));
          }
        });

        return Promise.all(promises);
      })
  };

  /**
   * Route for sending event status to couple
   * @param req
   * @param res
   * @param next
   */
  var sendEventStatusRoute = function (req, res, next) {
    sendEventStatus()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    sendEventStatus: sendEventStatus,
    sendEventStatusRoute: sendEventStatusRoute
  }
}();

if(env === 'development') {
  router.get('/cron/remind/wavesStarted', remindWavesStarted.sendEventStatusRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  remindWavesStarted: remindWavesStarted
};