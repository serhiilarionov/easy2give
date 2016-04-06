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
  instructionModule = require('../../../../app/controllers/cron/instruction.js'),
  smsQueueReferences = require('../../../../config/smsQueueReferences.js'),
  app = express(),
  server;

describe('Instruction controller', function() {
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

  it('should send instructions to couple', function(done) {
    instructionModule.instruction.sendInstruction()
      .then(function(events) {
        expect(events).to.be.an('array');
        expect(events).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});