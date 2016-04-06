'use strict';

var mongoose = require('mongoose-promised'),
  Template = mongoose.model('Template'),
  SmsQueue = mongoose.model('SmsQueue'),
  Sms = require('../../../app/services/sms.js'),
  TestData = require('../testingData/testData.js'),
  expect = require('chai').expect;

describe('Sms service', function () {
  before(function(done) {
    mongoose.connectQ(TestData.dbPath)
      .then(function(){
        return new Template(TestData.Sms.Template).saveQ()
      })
      .then(function (template) {
        TestData.Sms.Template.id = template[0]._id;
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        done(err);
      });
  });

  it('expect send sms', function (done) {
    var _Template = new Template();
    _Template.getContent(TestData.Sms.Template.name, TestData.paramsList)
      .then(function(template) {
        return Sms.send(TestData.Sms.phoneNumber, template);
      })
      .then(function(res){
        expect(res).to.be.a('object');
        expect(res).to.have.all.keys('DESCRIPTION', 'RESULT');
        done();
      })
      .catch(done);
  });

  after(function(done) {
    Template
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