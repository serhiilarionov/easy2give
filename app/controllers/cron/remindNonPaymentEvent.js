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
  SmsQueueService = require('../../services/smsQueue.js'),
  env = process.env.NODE_ENV || 'development';

var paidRemind = function () {
  /**
   * Send alert with non-payment events
   * @returns {*|Promise.<T>}
   */
  var remindByNotPaid = function() {
    var expirationDate = moment().subtract(2, 'd').format(dateFormats.format);
    var less = moment(expirationDate).add(1, 'm').format(dateFormats.format);
    return Event.where({
      _created_at: {$lte: less, $gt: expirationDate},
      disabledAt: {$exists: false},
      paymentDone: {$ne: true}
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          promises.push(SmsQueueService.sendCoupleSms(event, 'coupleBeforeNonPaymentEvent'))
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
