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

  return {
    coupleRemindCallCenter: coupleRemindCallCenter,
    coupleRemindCallCenterRoute: coupleRemindCallCenterRoute
  }
}();

if(env === 'development') {
  router.get('/cron/remind/callCenter', callCenter.coupleRemindCallCenterRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  callCenter: callCenter
};


///**
// * Get events for reminding that call center started
// * @param $date
// * @return \Parse\ParseObject[]
// */
//public function getCoupleCallCenterStarted($date)
//{
//  $query = new ParseQuery("Event");
//  $query->limit(1000);
//  $query->equalTo("callCenter", $date);
//  $query->equalTo("callRSVP", true);
//  return $query->find();
//}
//
///**
// * Send reminder that call center started
// * @param $eventList
// * @throws \Exception
// */
//public function sendCoupleCallCenterStarted($eventList)
//{
//  foreach ($eventList as $event) {
//  $event->set('eventStatus', $this->eventStatusListReverse[self::CALL_CENTER_STARTED]);
//  $event->save();
//  $this->sendAlertTemplate('callCenter', $event);
//}
//}