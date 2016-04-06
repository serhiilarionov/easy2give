var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  smsQueueReferences = require('../../../config/smsQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  _ = require('lodash'),
  env = process.env.NODE_ENV || 'development';

var remind = function () {
  /**
   * Send reminder about wedding to contacts
   * @returns {Promise.<T>}
   */
  var wedding = function() {
    var date = moment().format(dateFormats.format);

    return Event.where({
      smsRemind: true,
      //smsRemindDate: {$lte: date},
      smsRemindDate: date,
      smsAllowed: true
    }).findQ()
      .then(function(events) {
        var contactsPromises = [];
        var _Contact = new Contact();
        events.forEach(function(event) {
          contactsPromises.push(_Contact.getContactForWeddingReminder(event)
            .then(function(contacts) {
              return {
                event: event,
                contacts:contacts
              }
            }));
        });
        return Promise.each(contactsPromises, function(promise) {
          promise.contacts.forEach(function(contact) {
            var sms = {};
            sms.event = contact.event;
            sms.contact = contact.id;
            sms.status = smsQueueReferences.wait;
            sms.smsText = promise.event.smsRemindText;
            sms.phone = contact.phone;
            return new SmsQueue(sms).saveQ();
          })
        });
      });
  };

  /**
   * Route for remind about wedding
   * @param req
   * @param res
   * @param next
   */
  var weddingRoute = function (req, res, next) {
    remindWedding()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    wedding : wedding,
    weddingRoute : weddingRoute
  }
}();

if(env === 'development') {
  router.get('/cron/remind/wedding', remind.weddingRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  remind: remind
};


