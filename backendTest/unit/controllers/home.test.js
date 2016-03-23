'use strict';

var chai = require('chai'),
  request = require('supertest'),
  mongoose = require('mongoose-promised'),
  mockgoose = require('mockgoose'),
  app;

mockgoose(mongoose);
chai.should();

describe('Home controller', function() {
  before(function (done) {
    app = require('../../../app');
    done()
  });

  after(function (done) {
    mongoose.connection.close();
    app.close();
    done();
  });

    it('should return home page', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.status.should.be.equal(200);
          done();
        });
    });
});