'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  Event = require('../../../app/models/event.js'),
  Contact = require('../../../app/models/contact.js'),
  IvrQueue = require('../../../app/models/ivrQueue.js'),
  expect = require('chai').expect;

describe('IvrQueue model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event.model(TestData.Event).saveQ()
      })
      .then(function(event) {
        TestData.IvrQueue.event = event[0]._id;
        return new Contact.model(TestData.Contact).saveQ()
      })
      .then(function (contact) {
        TestData.IvrQueue.contact = contact[0]._id;
        return new IvrQueue.model(TestData.IvrQueue).saveQ()
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

  it('expect return the ivr from ivrQueue', function (done) {
    IvrQueue.model
      .where({
       _id: TestData.IvrQueue.id
      })
      .findOneQ()
      .then(function (ivrQueue) {
        expect(ivrQueue).to.be.an('object');
        expect(ivrQueue.status).to.equal(TestData.IvrQueue.status);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    IvrQueue.model
      .where({
        _id: TestData.IvrQueue.id
      }).removeQ()
      .then(function() {
        return Contact.model
          .where({
            _id: TestData.IvrQueue.contact
          }).removeQ()
      })
      .then(function() {
        return Event.model
          .where({
            _id: TestData.IvrQueue.event
          }).removeQ();
      })
      .then(function() {
        mongoose.connection.close();
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });
});