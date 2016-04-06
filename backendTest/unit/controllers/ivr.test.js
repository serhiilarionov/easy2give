'use strict';

var chai = require('chai'),
  chaiFiles = require('chai-files'),
  request = require('supertest'),
  mongoose = require('mongoose-promised'),
  express = require('express'),
  config = require('../../../config/config'),
  TestData = require('../testingData/testData.js'),
  Event = require('../../../app/models/event.js'),
  Contact = require('../../../app/models/contact.js'),
  app = express(),
  server;

chai.should();
chai.use(chaiFiles);

var expect = chai.expect,
  file = chaiFiles.file;

describe('IVR controller', function() {
  before(function (done) {
    require('../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return new Event.model(TestData.Event).saveQ()
        })
        .then(function(event) {
          TestData.Event.id = event[0]._id;
          TestData.Contact.event = event[0]._id;
          return new Contact.model(TestData.Contact).saveQ()
        })
        .then(function (contact) {
          TestData.Contact.id = contact[0]._id;
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
    Contact.model
      .where({
        _id: TestData.Contact.id
      })
      .removeQ()
      .then(function() {
        return Event.model
          .where({
            _id: TestData.Event.id
          }).removeQ();
      })
      .then(function() {
        mongoose.connection.close();
        server.close();
        done();
      })
      .catch(function(err){
        mongoose.connection.close();
        server.close();
        done(err);
      });
  });

  it('expect save record for IVR', function(done) {
    request(app)
      .post('/save-record')
      .field('eventId', TestData.Event.id.toString())
      .attach('file', 'backendTest/unit/testingData/test.mp3')
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        expect(file('public/ivr/mp3/' + TestData.Event.id.toString() + '/record.mp3')).to.exist;
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('expect redirect to ivr record', function(done) {
    request(app)
      .get('/ivr-mp3?lastnum=' + TestData.Contact.id)
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        expect(res.redirect).to.be.true;
        done();
      });
  });
});