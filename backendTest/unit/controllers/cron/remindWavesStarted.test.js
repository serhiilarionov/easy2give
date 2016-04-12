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
  remindWavesStartedModule = require('../../../../app/controllers/cron/remindWavesStarted.js'),
  smsQueueReferences = require('../../../../config/smsQueueReferences.js'),
  expect = require('chai').expect,
  app = express(),
  server;

chai.should();

describe('RemindWavesStarted controller', function() {
  before(function(done) {
    require('../../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return Event(TestData.EventLastWeek).saveQ()
        })
        .then(function(event) {
          TestData.EventLastWeek.id = event[0]._id;
          done();
        })
        .catch(done);
    });
  });

  after(function(done) {
    Event
      .where({
        _id: TestData.EventLastWeek.id
      }).removeQ()
      .then(function() {
        mongoose.connection.close();
        server.close();
        done();
      })
      .catch(done);
  });

  it('should save reminders to sms queue', function(done) {
    remindWavesStartedModule.remindWavesStarted.sendEventStatus(TestData.now)
      .then(function(smsQueue) {
        expect(smsQueue[0]).to.be.an('array');
        expect(smsQueue[0]).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});