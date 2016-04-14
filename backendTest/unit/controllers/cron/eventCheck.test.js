'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../../testingData/testData.js'),
  Event = require('../../../../app/models/event.js'),
  eventCheck = require('../../../../app/controllers/cron/eventCheck.js'),
  smsEventReferences = require('../../../../config/smsEventReferences.js'),
  expect = require('chai').expect;

describe('EventCheck controller', function () {
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

  it('expect send errors of events', function (done) {
    eventCheck.check.event()
      .then(function (res) {
        expect(res).to.be.true;
        done();
      })
      .catch(done);
  });

  after(function(done) {
    Event.model
      .where({
        _id: TestData.Event.id
      }).removeQ()
      .then(function() {
        mongoose.connection.close();
        done();
      })
      .catch(function(err) {
        mongoose.connection.close();
        done(err);
      });
  });
});