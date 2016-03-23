'use strict';

var Cron = function() {
  var CronJob = require('cron').CronJob,
    moment = require('moment'),
    File = require('./file.js'),
    clearOldData = require('../services/clearOldData.js');

  var jobs = [];
  var clearDataJob = new CronJob({
    cronTime: '0 * * * * 1',
    onTick: function() {
      var now = moment().subtract(7,'d').format();
      clearOldData('Error', now)
        .catch(function(err) {
          File.writeToFile('/error.log', err);
          Cron.stop(clearDataJob);
        });
    },
    start: true
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