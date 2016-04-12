'use strict';

var mongoose = require('mongoose-promised'),
  Template = mongoose.model('Template'),
  SmsQueue = mongoose.model('SmsQueue'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  IvrQueue = mongoose.model('IvrQueue'),
  IVRservice = require('../../../app/services/ivr.js'),
  TestData = require('../testingData/testData.js'),
  expect = require('chai').expect;

describe('Ivr service', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event(TestData.Event).saveQ()
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

  it('expect save response from ivr', function (done) {
    IVRservice.saveResponse(TestData.IvrQueue.contact, TestData.ivrResponse)
      .then(function(res){
        expect(res).to.be.a('array');
        expect(res).to.have.length.above(0);
        done();
      })
      .catch(done)
  });

  it('expect send ivr', function (done) {
    IVRservice.send(TestData.IvrQueue.phone, TestData.IvrQueue.contact)
      .then(function(res){
        expect(res).to.be.a('string');
        expect(res).to.have.length.above(0);
        done();
      })
      .catch(done);
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
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });
});