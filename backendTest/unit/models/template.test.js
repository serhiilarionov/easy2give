'use strict';

var mongoose = require('mongoose-promised'),
  TestData = require('../testingData/testData.js'),
  Template = require('../../../app/models/template.js'),
  expect = require('chai').expect;

describe('Template model', function () {
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

  it('expect create the template', function (done) {
    Template.model
      .where({
        name: TestData.Sms.Template.name,
        text:  TestData.Sms.Template.text
      })
      .findOneQ()
      .then(function (template) {
        expect(template).to.be.an('object');
        expect(template.name).to.equal(TestData.Sms.Template.name);
        expect(template.text).to.equal(TestData.Sms.Template.text);
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