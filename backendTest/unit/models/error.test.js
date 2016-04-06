'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  ErrorLog = require('../../../app/models/error.js'),
  expect = require('chai').expect;

describe('Error model', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function(){
        return new ErrorLog.model(TestData.ErrorLog).saveQ()
      })
      .then(function (error) {
        TestData.ErrorLog.id = error[0]._id;
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });

  it('expect return the error', function (done) {
    ErrorLog.model
      .where({
        _id: TestData.ErrorLog.id
      })
      .findOneQ()
      .then(function (error) {
        expect(error).to.be.an('object');
        expect(error.errorStatus).to.equal(TestData.ErrorLog.errorStatus);
        expect(error.errorMessage).to.equal(TestData.ErrorLog.errorMessage);
        done();
      })
      .catch(done);
  });

  after(function(done) {
    ErrorLog.model
      .where({
        _id: TestData.ErrorLog.id
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