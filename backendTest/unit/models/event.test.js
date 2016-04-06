'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  Event = require('../../../app/models/event.js'),
  EventPlace = require('../../../app/models/eventPlace.js'),
  expect = require('chai').expect;

describe('Event model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new EventPlace.model(TestData.EventPlace).saveQ()
      })
      .then(function(eventPlace) {
        TestData.Event.eventPlace = eventPlace[0]._id;
        return new Event.model(TestData.Event).saveQ()
      })
      .then(function (event) {
        TestData.Event.id = event[0]._id;
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });

  it('expect return the event', function (done) {
    Event.model
      .where({
       _id: TestData.Event.id
      })
      .findOneQ()
      .then(function (event) {
        expect(event).to.be.an('object');
        expect(event.password).to.equal(TestData.Event.password);
        expect(event.coupleId).to.equal(TestData.Event.coupleId);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    Event.model
      .where({
        _id: TestData.Event.id
      })
      .removeQ()
      .then(function() {
        return EventPlace.model
          .where({
            _id: TestData.Event.eventPlace
          })
          .removeQ()
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