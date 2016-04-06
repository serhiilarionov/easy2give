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

var remindWaves = function () {
  /**
   * Send reminder about not set first or second dates of waves
   * @returns {*|Promise.<T>}
   */
  var datesWavesNotSet = function() {
    var expirationDate = moment().add(14, 'd').format(dateFormats.format);
    var or = [];
    or.push({firstWave: {$exists: false}});
    or.push({secondWave: {$exists: false}});
    return Event.where({
      date: {$gte: expirationDate},
      //date: expirationDate,
      smsAllowed: true,
      $or: or
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          var waveType = templates.coupleAlertText;
          promises.push(
            smsQueue.sendCoupleSms(event, waveType, [])
          )
        });

        return Promise.all(promises);
      })
  };

  /**
   * Route for sending reminder about not set first or second dates of waves
   * @param req
   * @param res
   * @param next
   */
  var datesWavesNotSetRoute = function (req, res, next) {
    datesWavesNotSet()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    datesWavesNotSet: datesWavesNotSet,
    datesWavesNotSetRoute: datesWavesNotSetRoute
  }
}();

if(env === 'development') {
  router.get('/cron/remind/wavesNotSet', remindWaves.datesWavesNotSetRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  remindWaves: remindWaves
};