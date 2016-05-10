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
  SmsQueueService = require('../../services/smsQueue.js'),
  Email = require('../../services/email.js'),
  env = process.env.NODE_ENV || 'development';

var instruction = function () {
  /**
   * Send instruction for couple
   * @returns {*|Promise.<T>}
   */
  var sendInstruction = function() {
    return Event.where({
      isInstructionSent: false
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          //prepare params for template
          var paramsList = {
            coupleId: event.coupleId,
            password: event.password
          };
          var waveType = templates.instruction;

          var filePath = './public/templates/email/instruction.html';
          var subject = 'Easy2Give מודה לכם שהצטרפתם לשירות וידואי הגעה לאירוע - להלן פרטי הכניסה שלכם';
          if(event.groomEmail || event.brideEmail) {
            var emailList = [
              event.groomEmail,
              event.brideEmail
            ];
            //send email
            promises.push(Email.send(filePath, subject, emailList, paramsList)
              .then(function() {
                //send sms
                return SmsQueueService.sendCoupleSms(event, waveType, paramsList)
              })
              .then(function() {
                event.isInstructionSent = true;
                return event.saveQ();
              })
            )
          }
        });

        return Promise.all(promises);
      })
  };

  /**
   * Route for sending instruction for couple
   * @param req
   * @param res
   * @param next
   */
  var sendInstructionRoute = function (req, res, next) {
    sendInstruction()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    sendInstruction: sendInstruction,
    sendInstructionRoute: sendInstructionRoute
  }
}();

if(env === 'development') {
  router.get('/cron/send/instruction', instruction.sendInstructionRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  instruction: instruction
};
