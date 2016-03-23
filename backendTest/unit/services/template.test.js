'use strict';

var TestData = require('../testingData/testData.js'),
  Template = require('../../../app/services/template.js'),
  expect = require('chai').expect;

describe('Template service', function () {
  it('expect return template', function (done) {
    Template.getTemplate(TestData.Email.template, TestData.paramList)
      .then(function(res){
        expect(res).to.be.a('string');
        expect(res).to.have.length.above(1);
        done();
      })
      .catch(done);
  });
});