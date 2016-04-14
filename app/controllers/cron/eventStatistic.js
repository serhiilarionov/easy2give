var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  emailConfig = require('../../../config/email.js'),
  smsQueueReferences = require('../../../config/smsQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  _ = require('lodash'),
  Email = require('../../services/email.js'),
  env = process.env.NODE_ENV || 'development';

var send = function () {
  /**
   * Sending statistic about sending smses
   * @returns {Promise.<T>}
   */
  var statistic = function() {
    var less = moment().format(dateFormats.format);
    var expirationDate = moment().subtract(1, 'd').format(dateFormats.format);
    var paramsList = {};
    var statuses = {};
    return SmsQueue.where({
      _created_at: {$lte: less, $gt: expirationDate}
    }).countQ()
      .then(function(count) {
        paramsList.total = count;
        var promises = [];
        Object.keys(smsQueueReferences).forEach(function(key) {
          promises.push(
            SmsQueue.where({
              _created_at: {$lte: less, $gt: expirationDate},
              status: smsQueueReferences[key]
            }).countQ()
              .then(function(count) {
                statuses[key] = count;
              })
          )
        });
        return Promise.all(promises)
          .then(function() {
            paramsList.statuses = statuses;
            paramsList.date = moment().format(dateFormats.format);

            var subject = "Statistic of sms sending.";
            var filePath = "./public/templates/email/statistic.html";
            var emailList = emailConfig.adminEmail;
            return Email.send(filePath, subject, emailList, paramsList);
          })

    })
  };

  /**
   * Route for sending statistic to admin
   * @param req
   * @param res
   * @param next
   */
  var statisticRoute = function (req, res, next) {
    statistic()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    statistic : statistic,
    statisticRoute : statisticRoute
  }
}();

if(env === 'development') {
  router.get('/cron/send/statistic', send.statisticRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  send: send
};