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
  callCenterModule = require('../../../../app/controllers/cron/remindCallCenter.js'),
  smsQueueReferences = require('../../../../config/smsQueueReferences.js'),
  _ = require('lodash'),
  expect = require('chai').expect,
  app = express(),
  server;

chai.should();

describe('CallCenter controller', function() {
  before(function(done) {
    require('../../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return Event(TestData.EventYesterday).saveQ()
        })
        .then(function(event) {
          TestData.EventYesterday.id = event[0]._id;
          done();
        })
        .catch(function(err){
          mongoose.connection.close();
          server.close();
          done(err);
        });
    });
  });

  after(function(done) {
    Event
      .where({
        _id: TestData.EventYesterday.id
      }).removeQ()
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

  it('should save sms to sms queue', function(done) {
    callCenterModule.callCenter.coupleRemindCallCenter()
      .then(function(smsQueue) {
        expect(smsQueue[0]).to.be.an('array');
        expect(smsQueue[0]).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});