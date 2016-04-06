'use strict';

var mongoose = require('mongoose-promised'),
  Event = require('../../../app/models/event.js'),
  TestData = require('../testingData/testData.js'),
  smsQueue = require('../../../app/services/smsQueue.js'),
  expect = require('chai').expect;

describe('Sms queue service', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function() {
        return new Event.model(TestData.Event).saveQ()
      })
      .then(function(event) {
        TestData.Event.id = event[0]._id;
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
    });

  it('expect add sms to sms queue', function (done) {
    smsQueue.sendCoupleSms(TestData.Event, TestData.waveType, TestData.paramsList)
      .then(function(res) {
        expect(res[0]).to.be.an('array');
        expect(res[0][0].event).to.equal(TestData.Event.id);
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
        mongoose.connection.close();
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });
});