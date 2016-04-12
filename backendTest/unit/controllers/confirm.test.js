'use strict';

var chai = require('chai'),
  request = require('supertest'),
  mongoose = require('mongoose-promised'),
  express = require('express'),
  config = require('../../../config/config'),
  TestData = require('../testingData/testData.js'),
  EventPlace = require('../../../app/models/eventPlace.js'),
  Event = require('../../../app/models/event.js'),
  Contact = require('../../../app/models/contact.js'),
  app = express(),
  server;

chai.should();

describe('Confirm controller', function() {
  before(function(done) {
    require('../../../config/express')(app, config);
    server = app.listen(config.port, function() {
      mongoose.connectQ(TestData.dbPath)
        .then(function() {
          return new EventPlace.model(TestData.EventPlace).saveQ()
        })
        .then(function(eventPlace) {
          TestData.Event.eventPlace = eventPlace[0]._id;
          return new Event.model(TestData.Event).saveQ()
        })
        .then(function(event) {
          TestData.Contact.event = event[0]._id;
          return new Contact.model(TestData.Contact).saveQ()
        })
        .then(function(contact) {
          TestData.Contact.id = contact[0]._id;
          done();
        })
        .catch(function(err) {
          mongoose.connection.close();
          server.close();
          done(err);
        });
    });
  });

  after(function(done) {
    Contact.model
      .where({
        _id: TestData.Contact.id
      })
      .removeQ()
      .then(function() {
        return Event.model
          .where({
            _id: TestData.Contact.event
          })
          .removeQ()
          .then(function() {
            return EventPlace.model
              .where({
                _id: TestData.Event.eventPlace
              })
              .removeQ()
          })
          .then(function() {
            mongoose.connection.close();
            server.close();
            done();
          })
          .catch(function(err) {
            mongoose.connection.close();
            server.close();
            done(err);
          });
      });
  });

  it('should return test confirm page', function(done) {
    request(app)
      .get('/e?eventId=' + TestData.Contact.event)
      .end(function(err, res) {
        if (err) return done(err);
        res.status.should.be.equal(200);
        res.text.length.should.be.above(0);
        done();
      });
  });

  it('should return confirm page', function(done) {
    request(app)
      .get('/c?code=' + TestData.Contact.id)
      .end(function(err, res) {
        if (err) return done(err);
        res.status.should.be.equal(200);
        res.text.length.should.be.above(0);
        done();
      });
  });

  it('should return confirm page', function(done) {
    request(app)
      .post('/change-status')
      .send({
        status: TestData.confirmStatusMaybe,
        guest: TestData.guestsNumber,
        contact: TestData.Contact.id
      })
      .end(function(err, res) {
        if (err) return done(err);
        res.status.should.be.equal(200);
        Contact.model.where({_id: TestData.Contact.id}).findOneQ()
          .then(function(contact) {
            contact.status.should.be.equal(TestData.confirmStatusMaybe);
            contact.numberOfGuests.should.be.equal(TestData.guestsNumber);
            done();
          })
          .catch(done);
      });
  });
});