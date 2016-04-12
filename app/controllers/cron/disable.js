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
  File = require('../../services/file.js'),
  _ = require('lodash'),
  env = process.env.NODE_ENV || 'development';

var disable = function () {

  /**
   * Disable events by expiration date
   * @returns {*|Promise.<T>}
   */
  var disableByExpirationDate = function() {
    var expirationDate = moment().subtract(7, 'd').format(dateFormats.format);

    return Event.where({
      date: {$lte: expirationDate},
      disabledAt: {$exists: false},
      paymentDone: true
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          event.disabledAt = moment().format(dateFormats.format);
          event.eventStatus = (_.invert(eventReferences.eventStatuses))
            ['Passed'];
          promises.push(
            event.saveQ()
          )
        });

        return Promise.each(promises, function(promise) {
          File.writeToFile('/disable.log', 'EventId: ' + promise[0].id + ' CoupleId: '
            + promise[0].coupleId + '. Disabled by expiration date: ' + moment(promise[0].date).format(dateFormats.formatLog));
        })
      })
  };

  /**
   * Disable not paid events
   */
  var disableByNotPaid = function() {
    var expirationDate = moment().subtract(3, 'd').format(dateFormats.format);

    return Event.where({
      _created_at: {$lte: expirationDate},
      disabledAt: {$exists: false},
      paymentDone: {$ne: true}
    }).findQ()
      .then(function(events) {
        var promises = [];
        events.forEach(function(event) {
          event.disabledAt = moment().format(dateFormats.format);
          event.eventStatus = (_.invert(eventReferences.eventStatuses))
            ['Not paid'];
          promises.push(
            event.saveQ()
          )
        });

        return Promise.each(promises, function(promise) {
          File.writeToFile('/disable.log', 'EventId: ' + promise[0].id + ' CoupleId: '
            + promise[0].coupleId + '. Disabled. Event not payed.');
        })
      })
  };

  /**
   * Route for disabling events by expiration date
   * @param req
   * @param res
   * @param next
   */
  var disableByExpirationDateRoute = function (req, res, next) {
    disableByExpirationDate()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  /**
   * Route for disabling not paid events
   * @param req
   * @param res
   * @param next
   */
  var disableByNotPaidRoute = function (req, res, next) {
    disableByNotPaid()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    byExpirationDate: disableByExpirationDate,
    byExpirationDateRoute: disableByExpirationDateRoute,
    byNotPaid: disableByNotPaid,
    byNotPaidRoute: disableByNotPaidRoute
  }
}();

if(env === 'development') {
  router.get('/cron/disable/notPaid', disable.byNotPaidRoute);
  router.get('/cron/disable/expirationDate', disable.byExpirationDateRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  disable: disable
};

