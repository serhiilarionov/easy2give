'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  Event = require('../../../app/models/event.js'),
  Contact = require('../../../app/models/contact.js'),
  SmsQueue = require('../../../app/models/smsQueue.js'),
  expect = require('chai').expect;

describe('SmsQueue model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event.model(TestData.Event).saveQ()
      })
      .then(function(event) {
        TestData.SmsQueue.event = event[0]._id;
        return new Contact.model(TestData.Contact).saveQ()
      })
      .then(function (contact) {
        TestData.SmsQueue.contact = contact[0]._id;
        return new SmsQueue.model(TestData.SmsQueue).saveQ()
      })
      .then(function (smsQueue) {
        TestData.SmsQueue.id = smsQueue[0]._id;
        done();
      })
      .catch(done);
  });

  it('expect create the smsQueue', function (done) {
    SmsQueue.model
      .where({
       _id: TestData.SmsQueue.id
      })
      .findOneQ()
      .then(function (smsQueue) {
        expect(smsQueue).to.be.an('object');
        expect(smsQueue.status).to.equal(TestData.SmsQueue.status);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    SmsQueue.model
      .where({
        _id: TestData.SmsQueue.id
      }).removeQ()
      .then(function() {
        return Contact.model
          .where({
            _id: TestData.SmsQueue.contact
          }).removeQ()
      })
      .then(function() {
        return Event.model
          .where({
            _id: TestData.SmsQueue.event
          }).removeQ();
      })
      .then(function() {
        mongoose.connection.close();
        done();
      })
      .catch(done);
  });
});