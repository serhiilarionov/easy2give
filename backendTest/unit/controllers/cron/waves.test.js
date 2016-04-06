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
  wavesModule = require('../../../../app/controllers/cron/waves.js'),
  _ = require('lodash'),
  app = express(),
  server;
require('events').EventEmitter.prototype._maxListeners = 0;
chai.should();

describe('Waves controller', function() {
  const FIRST_WAVE_FIELD = 'firstWave';
  const SECOND_WAVE_FIELD = 'secondWave';

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
        .catch(function(err){
          mongoose.connection.close();
          server.close();
          done(err);
        });
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
      .catch(function(err){
        mongoose.connection.close();
        server.close();
        done(err);
      });
  });

  it('should start first wave', function(done) {
    wavesModule.waves.notifyWave(FIRST_WAVE_FIELD, TestData.now)
      .then(function() {
        return Event.where({_id: TestData.SmsQueue.event}).findOneQ();
      })
      .then(function(event) {
        //get current event status
        var eventStatus = parseInt((_.invert(eventReferences.eventStatuses))
          [eventReferences.eventWavesTypes[FIRST_WAVE_FIELD][eventReferences.waveStatus.start]]);
        event.eventStatus.should.be.equal(eventStatus);
        done();
      })
      .catch(done);
  });

  it('should start second wave', function(done) {
    wavesModule.waves.notifyWave(SECOND_WAVE_FIELD, TestData.now)
      .then(function() {
        return Event.where({_id: TestData.SmsQueue.event}).findOneQ();
      })
      .then(function(event) {
        //get current event status
        var eventStatus = parseInt((_.invert(eventReferences.eventStatuses))
          [eventReferences.eventWavesTypes[SECOND_WAVE_FIELD][eventReferences.waveStatus.start]]);
        event.eventStatus.should.be.equal(eventStatus);
        done();
      })
      .catch(done);
  });
});