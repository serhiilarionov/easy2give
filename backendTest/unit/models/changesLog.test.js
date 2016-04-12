'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  ChangesLog = require('../../../app/models/changesLog.js'),
  Event = require('../../../app/models/event.js'),
  expect = require('chai').expect;

describe('ChangesLog model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event.model(TestData.Event).saveQ()
      })
      .then(function(event) {
        TestData.ChangesLog.contentId = event[0]._id;
        return new ChangesLog.model(TestData.ChangesLog).saveQ()
      })
      .then(function (changesLog) {
        TestData.ChangesLog.id = changesLog[0]._id;
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });

  it('expect return the created changes of log', function (done) {
    ChangesLog.model
      .where({
        _id: TestData.ChangesLog.id
      })
      .findOneQ()
      .then(function (changesLog) {
        expect(changesLog).to.be.an('object');
        expect(changesLog.action).to.equal(TestData.ChangesLog.action);
        expect(changesLog.contentId).to.equal(TestData.ChangesLog.contentId);
        expect(changesLog.details).to.equal(TestData.ChangesLog.details);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    ChangesLog.model
      .where({
        _id: TestData.ChangesLog.id
      })
      .removeQ()
      .then(function() {
        return Event.model
          .where({
            _id: TestData.ChangesLog.contentId
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