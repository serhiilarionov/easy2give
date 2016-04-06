'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  EventPlace = require('../../../app/models/eventPlace.js'),
  url = require('../../../config/url.js'),
  expect = require('chai').expect;

describe('EventPlace model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function(){
        return new EventPlace.model(TestData.EventPlace).saveQ()
      })
      .then(function (eventPlace) {
        TestData.EventPlace.id = eventPlace[0]._id;
        done();
      })
      .catch(done);
  });

  it('expect find the event place', function (done) {
    EventPlace.model
      .where({
        _id: TestData.EventPlace.id
      })
      .findOneQ()
      .then(function (eventPlace) {
        expect(eventPlace).to.be.an('object');
        expect(eventPlace.venueName).to.equal(TestData.EventPlace.venueName);
        done();
      })
      .catch(done);
  });

  it('expect return the event place url and name', function (done) {
    var _EventPlace = new EventPlace.model();
    _EventPlace
      .getEventPlace(TestData.EventPlace.id, TestData.Event.showBanner)
      .then(function (eventPlace) {
        expect(eventPlace).to.be.an('object');
        expect(eventPlace.name).to.equal(TestData.EventPlace.venueName);
        expect(eventPlace.url).to.equal(url.eventPlaceUrl + TestData.EventPlace.id + '?banner');
        done();
      })
      .catch(done);
  });

  after(function(done) {
    EventPlace.model
      .where({
        _id: TestData.EventPlace.id
      })
      .removeQ()
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