'use strict';

var chai = require('chai'),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  moment = require('moment'),
  dateFormats = require('../../../../config/dateFormats.js'),
  express = require('express'),
  config = require('../../../../config/config'),
  eventReferences = require('../../../../config/eventReferences.js'),
  TestData = require('../../testingData/testData.js'),
  _ = require('lodash'),
  app = express(),
  server;
require('../../../../config/express')(app, config);

var IvrQueue = mongoose.model('IvrQueue'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  ivrModule = require('../../../../app/controllers/cron/ivr.js');

require('events').EventEmitter.prototype._maxListeners = 0;
chai.should();

describe('IVR controller', function() {
  before(function(done) {
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return new Event(TestData.EventThreeDaysAgo).saveQ()
        })
        .then(function(event) {
          TestData.IvrQueue.event = event[0]._id;
          return new Contact(TestData.Contact).saveQ()
        })
        .then(function (contact) {
          TestData.IvrQueue.contact = contact[0]._id;
          return new IvrQueue(TestData.IvrQueue).saveQ()
        })
        .then(function (ivrQueue) {
          TestData.IvrQueue.id = ivrQueue[0]._id;
          done();
        })
        .catch(function(err){
          mongoose.connection.close();
          done(err);
        });
    });
  });

  after(function(done) {
    IvrQueue
      .where({
        _id: TestData.IvrQueue.id
      }).removeQ()
      .then(function() {
        return Contact
          .where({
            _id: TestData.IvrQueue.contact
          }).removeQ()
      })
      .then(function() {
        return Event
          .where({
            _id: TestData.IvrQueue.event
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

  it('should start IVR', function(done) {
    ivrModule.ivr.notifyIVR()
      .then(function() {
        return Event.where({_id: TestData.IvrQueue.event}).findOneQ();
      })
      .then(function(event) {
        //get current event status
        var eventStatus = parseInt((_.invert(eventReferences.eventStatuses))
          [eventReferences.eventWavesTypes['IVR'][eventReferences.waveStatus.start]]);
        event.eventStatus.should.be.equal(eventStatus);
        done();
      })
      .catch(done);
  });

  it('should send ivr from ivr queue', function(done) {
    ivrModule.ivr.send()
      .then(function() {
        done();
      })
      .catch(done);
  });
});