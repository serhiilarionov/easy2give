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
  env = process.env.NODE_ENV || 'development';

var callCenter = function () {
  /**
   * Send reminder before starting a call center to couple
   * @returns {*|Promise.<T>}
   */
  var coupleRemindCallCenter = function() {
    var expirationDate = moment().subtract(1, 'd').format(dateFormats.format);

    return Event.where({
      secondWave: expirationDate,
      callRSVP: true,
      callCenter: {$exists: true, $ne: null}
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          var paramsList = {
            callCenter: moment(event.callCenter).format(dateFormats.format),
            callTeamLimit: event.callTeamLimit ? event.callTeamLimit : 'all'
          };
          var waveType = templates.coupleRemindCallCenterStart;
          promises.push(
            smsQueue.sendCoupleSms(event, waveType, paramsList)
          )
        });

        return Promise.all(promises);
      })
  };

  /**
   * Send reminder that call center started
   * @returns {Promise.<T>|*}
   */
  var callCenterStarted = function() {
    var expirationDate = moment().format(dateFormats.format);
    return Event.where({
      callCenter: expirationDate,
      callRSVP: true
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          var paramsList = {
            callCenter: moment(event.callCenter).format(dateFormats.format),
            callTeamLimit: event.callTeamLimit ? event.callTeamLimit : 'all'
          };
          var waveType = templates.coupleCallCenterStarted;
          promises.push(
            smsQueue.sendCoupleSms(event, waveType, paramsList)
              .then(function() {
                return {
                  event: event
                }
              })
          )
        });
        return Promise.each(promises, function(promise) {
          promise.event.eventStatus = (_.invert(eventReferences.eventStatuses))
            [eventReferences.eventWavesTypes['callCenter'][eventReferences.waveStatus.start]];
          return promise.event.saveQ();
        });

      })
  };

  /**
   * Route for sending reminder before starting a call center to couple
   * @param req
   * @param res
   * @param next
   */
  var coupleRemindCallCenterRoute = function (req, res, next) {
    coupleRemindCallCenter()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };


  var callCenterStartedRoute = function (req, res, next) {
    callCenterStarted()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    coupleRemindCallCenter: coupleRemindCallCenter,
    coupleRemindCallCenterRoute: coupleRemindCallCenterRoute,
    callCenterStarted: callCenterStarted,
    callCenterStartedRoute: callCenterStartedRoute
  }
}();

if(env === 'development') {
  router.get('/cron/remind/callCenter', callCenter.coupleRemindCallCenterRoute);
  router.get('/cron/remind/callCenterStarted', callCenter.callCenterStartedRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  callCenter: callCenter
};