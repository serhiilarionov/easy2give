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
  smsModule = require('../../../../app/controllers/cron/sms.js'),
  _ = require('lodash'),
  app = express(),
  server;

chai.should();

describe('Send controller', function() {
  before(function (done) {
    require('../../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return Event(TestData.Event).saveQ()
        })
        .then(function(event) {
          TestData.SmsQueue.event = event[0]._id;
          return Contact(TestData.Contact).saveQ()
        })
        .then(function (contact) {
          TestData.SmsQueue.contact = contact[0]._id;
          return SmsQueue(TestData.SmsQueue).saveQ()
        })
        .then(function (smsQueue) {
          TestData.SmsQueue.id = smsQueue[0]._id;
          done();
        })
        .catch(done);
    });
  });

  after(function (done) {
    SmsQueue
      .where({
        _id: TestData.SmsQueue.id
      }).removeQ()
      .then(function() {
        return Contact
          .where({
            _id: TestData.SmsQueue.contact
          }).removeQ()
      })
      .then(function() {
        return Event
          .where({
            _id: TestData.SmsQueue.event
          }).removeQ();
      })
      .then(function() {
        mongoose.connection.close();
        server.close();
        done();
      })
      .catch(done);
  });

  it('should send sms from sms queue', function(done) {
    smsModule.send.sms()
      .then(function() {
        done();
      })
      .catch(done);
  });
});