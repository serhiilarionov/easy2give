'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  Template = require('../../../app/models/template.js'),
  Sms = require('../../../app/services/sms.js'),
  expect = require('chai').expect;

describe('Sms service', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function(){
        return new Template.model(TestData.Sms.Template).saveQ()
      })
      .then(function (template) {
        TestData.Sms.Template.id = template[0]._id;
        done();
      })
      .catch(done);
  });

  it('expect send sms', function (done) {
    Sms.send(TestData.Sms.phoneNumber, TestData.Sms.Template.name, TestData.paramList)
      .then(function(res){
        expect(res).to.be.true;
        done();
      })
      .catch(done);
  });

  after(function(done) {
    Template.model
      .where({
        _id: TestData.Sms.Template.id
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