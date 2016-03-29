'use strict';

var chai = require('chai'),
  request = require('supertest'),
  mongoose = require('mongoose-promised'),
  express = require('express'),
  config = require('../../../config/config'),
  TestData = require('../testingData/testData.js'),
  app = express(),
  server;

chai.should();

describe('Home controller', function() {

  before(function (done) {
    require('../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connect(TestData.dbPath, function(err) {
        done(err);
      });
    });
  });

  after(function (done) {
    mongoose.connection.close();
    server.close();
    done();
  });

  it('should return home page', function(done) {
    request(app)
      .get('/')
      .end(function(err, res) {
        if (err) return done(err);
        res.status.should.be.equal(200);
        done();
      });
  });
});