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
  remindWeddingModule = require('../../../../app/controllers/cron/remindWedding.js'),
  _ = require('lodash'),
  expect = require('chai').expect,
  app = express(),
  server;

chai.should();

describe('RemindWedding controller', function() {
  before(function(done) {
    require('../../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return Event(TestData.Event).saveQ()
        })
        .then(function(event) {
          TestData.Contact.event = event[0]._id;
          return Contact(TestData.Contact).saveQ()
        })
        .then(function(contact) {
          TestData.Contact.id = contact[0]._id;
          done();
        })
        .catch(done);
    });
  });

  after(function(done) {
    Contact.where({
      _id: TestData.Contact.id
    }).removeQ()
      .then(function() {
        return Event
          .where({
            _id: TestData.Contact.event
          }).removeQ()
      })
      .then(function() {
        mongoose.connection.close();
        server.close();
        done();
      })
      .catch(done);
  });

  it('should save reminders to sms queue', function(done) {
    remindWeddingModule.remind.wedding()
      .then(function(smsQueue) {
        expect(smsQueue).to.be.an('array');
        expect(smsQueue).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});