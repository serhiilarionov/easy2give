'use strict';

var TestData = require('../testingData/testData.js'),
  Email = require('../../../app/services/email.js'),
  expect = require('chai').expect;

describe('Email service', function () {
  it('expect send email', function (done) {
    Email.send(TestData.Email.template, TestData.Email.subject,
      TestData.Email.mailList, TestData.paramsList)
     .then(function(res){
        expect(res).to.be.true;
        done();
      })
      .catch(done);
  });
});