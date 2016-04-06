'use strict';

var chai = require('chai'),
  request = require('supertest'),
  mongoose = require('mongoose-promised'),
  express = require('express'),
  config = require('../../../config/config'),
  TestData = require('../testingData/testData.js'),
  EventPlace = require('../../../app/models/eventPlace.js'),
  app = express(),
  server;

chai.should();

describe('Event place controller', function() {
  before(function (done) {
    require('../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function(){
          return new EventPlace.model(TestData.EventPlace).saveQ()
        })
        .then(function (eventPlace) {
          TestData.EventPlace.id = eventPlace[0]._id;
          done();
        })
        .catch(function(err){
          mongoose.connection.close();
          server.close();
          done(err);
        });
    });
  });

  after(function (done) {
    EventPlace.model.where({
      _id: TestData.EventPlace.id
    }).removeQ()
      .then(function() {
        mongoose.connection.close();
        server.close();
        done();
      })
      .catch(function(err) {
        mongoose.connection.close();
        server.close();
        done(err);
      })
  });

  it('should return event place page', function(done) {
    request(app)
      .get('/p?eventPlaceId=' + TestData.EventPlace.id)
      .end(function(err, res) {
        if (err) return done(err);
        res.status.should.be.equal(200);
        res.text.length.should.be.above(0);
        done();
      });
  });
});