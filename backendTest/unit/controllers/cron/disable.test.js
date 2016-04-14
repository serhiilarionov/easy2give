'use strict';

var chai = require('chai'),
  expect = require('chai').expect,
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
  disableModule = require('../../../../app/controllers/cron/disable.js'),
  smsQueueReferences = require('../../../../config/smsQueueReferences.js'),
  app = express(),
  server;

describe('Disable controller', function() {
  before(function(done) {
    require('../../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          done();
        })
        .catch(done);
    });
  });

  beforeEach(function(done) {
    Event(TestData.EventLastWeek).saveQ()
      .then(function(event) {
        TestData.EventLastWeek.id = event[0]._id;
        done();
      })
      .catch(done);
  });

  after(function(done) {
    mongoose.connection.close();
    server.close();
    done();
  });

  afterEach(function(done) {
    Event
      .where({
        _id: TestData.EventLastWeek.id
      }).removeQ()
      .then(function() {
        done();
      })
      .catch(done);
  });

  it('expect disable event by expiration date', function(done) {
    Event.where({
      _id: TestData.EventLastWeek.id
    }).findOneQ()
      .then(function(event) {
        event.paymentDone = true;
        return event.saveQ();
      })
      .then(function() {
        return disableModule.disable.byExpirationDate();
      })
      .then(function(events) {
        expect(events).to.be.an('array');
        expect(events).to.have.length.above(0);
        done();
      })
      .catch(done);
  });

  it('expect disable event by not paid', function(done) {
    Event.where({
      _id: TestData.EventLastWeek.id
    }).findOneQ()
      .then(function(event) {
        event.paymentDone = false;
        return event.saveQ();
      })
      .then(function() {
        return disableModule.disable.byNotPaid();
      })
      .then(function(events) {
        expect(events).to.be.an('array');
        expect(events).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});