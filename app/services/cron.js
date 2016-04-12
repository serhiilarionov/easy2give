'use strict';

var Cron = function() {
  var CronJob = require('cron').CronJob,
    moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    File = require('./file.js'),
    wavesModule = require('../controllers/cron/waves.js'),
    smsModule = require('../controllers/cron/sms.js'),
    disableModule = require('../controllers/cron/disable.js'),
    remindWeddingModule = require('../controllers/cron/remindWedding.js'),
    callCenterModule = require('../controllers/cron/remindCallCenter.js'),
    clearOldData = require('../services/clearOldData.js');

  const FIRST_WAVE_FIELD = 'firstWave';
  const SECOND_WAVE_FIELD = 'secondWave';

  var jobs = [];

  /**
   * Cron task for clear old errors
   * @type {*|CronJob}
   */
  var clearDataJob = new CronJob({
    cronTime: '0 * * * * 6',
    onTick: function() {
      var now = moment().subtract(7,'d').format(dateFormats.format);
      clearOldData('Error', now)
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(clearDataJob);
        });
    },
    start: false
  });

  /**
   * Cron tast for start first wave
   * @type {*|CronJob}
   */
  var firstWave = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      var now = moment().format(dateFormats.format);
      wavesModule.waves.notifyWave(FIRST_WAVE_FIELD, now)
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(firstWave);
        });
    },
    start: false
  });

  /**
   * Cron task for start second wave
   * @type {*|CronJob}
   */
  var secondWave = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      var now = moment().format(dateFormats.format);
      wavesModule.waves.notifyWave(SECOND_WAVE_FIELD, now)
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(secondWave);
        });
    },
    start: false
  });

  /**
   * Cron task for send sms from sms queue
   * @type {*|CronJob}
   */
  var sendSms = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      smsModule.send.sms()
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(sendSms);
        });
    },
    start: false
  });

  /**
   * Cron task for disable events by not paid
   * @type {*|CronJob}
   */
  var disableByNotPaid = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      disableModule.disable.byNotPaid()
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(disableByNotPaid);
        });
    },
    start: false
  });

  /**
   * Cron task for disable events by expiration date
   * @type {*|CronJob}
   */
  var disableByExpirationDate = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      disableModule.disable.byExpirationDate()
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(disableByExpirationDate);
        });
    },
    start: false
  });

  /**
   * Cron task for disable events by expiration date
   * @type {*|CronJob}
   */
  var remindWedding = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      remindWeddingModule.remind.remindWedding()
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(remindWedding);
        });
    },
    start: false
  });

  /**
   * Cron task for sending reminder before starting a call center to couple
   * @type {*|CronJob}
   */
  var coupleRemindCallCenter = new CronJob({
    cronTime: '0 * * * * *',
    onTick: function() {
      callCenterModule.callCenter.coupleRemindCallCenter()
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(coupleRemindCallCenter);
        });
    },
    start: false
  });

  jobs.push(clearDataJob);

  var show = function() {
    return jobs;
  };

  //launch of received the cron job
  var start = function(job) {
    if(job) {
      job.start();
      return true;
    }
   return false;
  };

  //add new cron job
  var newJob = function(cronName, time, func) {
    jobs[cronName] = new CronJob({
      cronTime: time,
      onTick: func,
      start: true
    });
  };

  //stop cron job
  var stop = function(job) {
    job.stop();
  };

  return {
    newJob: newJob,
    show: show,
    start: start,
    stop: stop
  }
}();

module.exports = Cron;