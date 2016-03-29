'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  Event = require('../../../app/models/event.js'),
  Contact = require('../../../app/models/contact.js'),
  expect = require('chai').expect;

describe('Contact model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event.model(TestData.Event).saveQ()
      })
      .then(function(event) {
        TestData.Contact.event = event[0]._id;
        return new Contact.model(TestData.Contact).saveQ()
      })
      .then(function (contact) {
        TestData.Contact.id = contact[0]._id;
        done();
      })
      .catch(done);
  });

  it('expect create the contact', function (done) {
    var _Contact = new Contact.model();
    _Contact
      .getContactForEvent(TestData.Contact.event)
      .then(function (contact) {
        expect(contact[0]).to.be.an('object');
        expect(contact[0].status).to.equal(TestData.Contact.status);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    Contact.model
      .where({
        _id: TestData.Contact.id
      })
      .removeQ()
      .then(function() {
        return Event.model
          .where({
            _id: TestData.Contact.event
          }).removeQ();
      })
      .then(function() {
        mongoose.connection.close();
        done();
      })
      .catch(done);
  });
});