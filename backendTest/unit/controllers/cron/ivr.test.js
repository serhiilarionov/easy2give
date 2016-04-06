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

describe('Waves controller', function() {
  before(function(done) {
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
        .catch(function(err) {
          mongoose.connection.close();
          server.close();
          done(err);
        });
    });
  });

  after(function(done) {
    Contact
      .where({
        _id: TestData.Contact.id
      }).removeQ()
    .then(function() {
      return Event
        .where({
          _id: TestData.Contact.event
        }).removeQ();
    })
    .then(function() {
      mongoose.connection.close();
      server.close();
      done();
    })
    .catch(function(err) {
      mongoose.connection.close();
      server.close();
      done(err);
    });
});

  it('should start IVR', function(done) {
    ivrModule.ivr.notifyIVR()
      .then(function() {
        return Event.where({_id: TestData.Contact.event}).findOneQ();
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
});