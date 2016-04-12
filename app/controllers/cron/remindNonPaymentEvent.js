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
  Email = require('../../services/email.js'),
  env = process.env.NODE_ENV || 'development';

var paidRemind = function () {
  /**
   * Send alert with non-payment events
   * @returns {*|Promise.<T>}
   */
  var remindByNotPaid = function() {
    var expirationDate = moment().subtract(2, 'd').format(dateFormats.format);
    return Event.where({
      _created_at: expirationDate,
      disabledAt: {$exists: false},
      paymentDone: {$ne: true}
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          var filePath = './public/templates/email/remindNonPaymentEvent.html';
          var subject = 'No payment was done on your account';
          if(event.groomEmail || event.brideEmail) {
            var emailList = [
              event.groomEmail,
              event.brideEmail
            ];
            emailList = emailList.toString();
            promises.push(Email.send(filePath, subject, emailList, []))
          }
        });

        return Promise.all(promises);
      })
  };

  /**
   * Route for sending alert with non-payment events
   * @param req
   * @param res
   * @param next
   */
  var remindByNotPaidRoute = function (req, res, next) {
    remindByNotPaid()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    byNotPaid: remindByNotPaid,
    byNotPaidRoute: remindByNotPaidRoute
  }
}();

if(env === 'development') {
  router.get('/cron/remind/notPaid', paidRemind.byNotPaidRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  paidRemind: paidRemind
};
