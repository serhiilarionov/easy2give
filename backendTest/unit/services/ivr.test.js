'use strict';

var mongoose = require('mongoose-promised'),
  Template = mongoose.model('Template'),
  SmsQueue = mongoose.model('SmsQueue'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  IVR = require('../../../app/services/ivr.js'),
  TestData = require('../testingData/testData.js'),
  expect = require('chai').expect;

describe('Ivr service', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event(TestData.Event).saveQ()
      })
      .then(function(event) {
        TestData.Contact.event = event[0]._id;
        return new Contact(TestData.Contact).saveQ()
      })
      .then(function (contact) {
        TestData.Contact.id = contact[0]._id;
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });

  it('expect save response from ivr', function (done) {
    IVR.saveResponse(TestData.Contact.id, TestData.ivrResponse)
      .then(function(res){
        expect(res).to.be.a('array');
        expect(res).to.have.length.above(0);
        done();
      })
      .catch(done)
  });

  it('expect return url for redirect', function (done) {
      IVR.redirectToRecord(TestData.Contact.id)
        .then(function(url) {
          expect(url).to.be.a('string');
          expect(url).to.have.length.above(0);
          done();
        })
        .catch(done)
  });

  after(function(done) {
    Contact
      .where({
        _id: TestData.Contact.id
      })
      .removeQ()
      .then(function() {
        return Event
          .where({
            _id: TestData.Contact.event
          }).removeQ();
      })
      .then(function() {
        mongoose.connection.close();
        done();
      })
      .catch(function(err) {
        mongoose.connection.close();
        done(err);
      })
  });
});