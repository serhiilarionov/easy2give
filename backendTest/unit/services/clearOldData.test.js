'use strict';

var mongoose = require('mongoose-promised'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats'),
  TestData = require('../testingData/testData.js'),
  ClearOldData = require('../../../app/services/clearOldData.js'),
  expect = require('chai').expect,
  model;

describe('Clear old data service', function () {
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
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });

  it('expect clear old data', function (done) {
    var now = moment().subtract(7,'d').format(dateFormats.format);
    ClearOldData(TestData.modelName, now)
      .then(function(){
        return model.where({createdAt: {"$lt": now}}).findQ()
      })
      .then(function(res) {
        expect(res).to.be.an('array');
        expect(res).to.have.lengthOf(0);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    model
      .where({
        _id: TestData[TestData.modelName].id
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