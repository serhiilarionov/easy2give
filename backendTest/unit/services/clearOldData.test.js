'use strict';

var mongoose = require('mongoose-promised'),
  moment = require('moment'),
  TestData = require('../testingData/testData.js'),
  ClearOldData = require('../../../app/services/clearOldData.js'),
  expect = require('chai').expect,
  model;

describe('Sms service', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function(){
        model = mongoose.model(TestData.modelName);
        return new model(TestData.ErrorLog).saveQ()
      })
      .then(function (template) {
        if(!TestData[TestData.modelName]) {
          TestData[TestData.modelName] = {};
        }
        TestData[TestData.modelName].id = template[0]._id;
        done();
      })
      .catch(done);
  });

  it('expect send sms', function (done) {
    var now = moment().format();
    ClearOldData('Error', now)
      .then(function(){
        return model.where({created_at: {"$lt": now}}).findQ()
      })
      .then(function(res) {
        expect(res).to.be.an('array');
        expect(res).to.have.lengthOf(0);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    mongoose.connection.close();
    done();
  });
});