var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  emailConfig = require('../../../config/email.js'),
  smsEventReferences = require('../../../config/smsEventReferences.js'),
  _ = require('lodash'),
  Email = require('../../services/email.js'),
  CheckContent = require('../../services/checkContent.js'),
  env = process.env.NODE_ENV || 'development';

var check = function () {
  /**
   * Checking sms content of event
   * @returns {Promise.<T>}
   */
  var event = function() {
    var paramsList = {};
    paramsList.errors = [];
    return Event.where({
      disabledAt: {$exists: false}
    }).findQ()
      .then(function(events) {
        events.forEach(function(event) {
          var errorLine = '';
          var errorLines = CheckContent.onEmptyContent(event, smsEventReferences.smsTextFields);
          if (errorLines) {
            //prepare params for template
            errorLines.forEach(function(error) {
              errorLine = errorLine ? errorLine + ", " + error : error;
            });

            var error = {
              'error': 'יש תוכן ריק בסמס.',
              'coupleId': event.coupleId,
              'errorLine': errorLine
            };
            paramsList.errors.push(error);
          }
        });
        var filePath = "./public/templates/email/event-error.html";
        var emailList = emailConfig.clientEmail;
        var subject = "טעות נמצעה באירוע.";
        return Email.send(filePath, subject, emailList, paramsList);
      });
  };

  /**
   * Route for checking sms content of event
   * @param req
   * @param res
   * @param next
   */
  var eventRoute = function (req, res, next) {
    event()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    event : event,
    eventRoute : eventRoute
  }
}();

if(env === 'development') {
  router.get('/cron/check/event', check.eventRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  check: check
};