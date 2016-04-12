'use strict';

var chai = require('chai'),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  moment = require('moment'),
  dateFormats = require('../../../../config/dateFormats.js'),
  express = require('express'),
  config = require('../../../../config/config'),
  eventReferences = require('../../../../config/eventReferences.js'),
  TestData = require('../../testingData/testData.js'),
  remindNonPaymentEventModule = require('../../../../app/controllers/cron/remindNonPaymentEvent.js'),
  _ = require('lodash'),
  expect = require('chai').expect,
  app = express(),
  server;

chai.should();

describe('RemindNonPaymentEvent controller', function() {
  before(function(done) {
    require('../../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return Event(TestData.Event).saveQ()
        })
        .then(function(event) {
          TestData.Event.id = event[0]._id;
          done();
        })
        .catch(done);
    });
  });

  after(function(done) {
    Event
      .where({
        _id: TestData.Event.id
      }).removeQ()
      .then(function() {
        mongoose.connection.close();
        server.close();
        done();
      })
      .catch(done);
  });

  it('should save reminders to sms queue', function(done) {
    remindNonPaymentEventModule.paidRemind.byNotPaid()
      .then(function(smsQueue) {
        expect(smsQueue).to.be.an('array');
        expect(smsQueue[0]).to.equal(true);
        done();
      })
      .catch(done);
  });
});