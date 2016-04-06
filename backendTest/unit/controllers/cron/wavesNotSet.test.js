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
  wavesNotSetModule = require('../../../../app/controllers/cron/wavesNotSet.js'),
  smsQueueReferences = require('../../../../config/smsQueueReferences.js'),
  _ = require('lodash'),
  expect = require('chai').expect,
  app = express(),
  server;

chai.should();

describe('WavesNonSet controller', function() {
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

  it('should save sms to sms queue', function(done) {
    wavesNotSetModule.remindWaves.datesWavesNotSet()
      .then(function(smsQueue) {
        expect(smsQueue[0]).to.be.an('array');
        expect(smsQueue[0]).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});