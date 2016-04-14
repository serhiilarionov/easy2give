var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  EventPlace = mongoose.model('EventPlace'),
  ChangesLog = mongoose.model('ChangesLog'),
  changesLogReferences = require('../../config/changesLogReferences.js'),
  clearOldData = require('../services/clearOldData.js'),
  cron = require('../services/cron.js'),
  moment = require('moment'),
  url = require('../../config/url.js'),
  parseServer = require('../../config/parseServer.js'),
  DateLink = require('../services/dateLink.js'),
  dateFormats = require('../../config/dateFormats.js'),
  _ = require('lodash');

module.exports = {
  controller: function (app) {
    app.use('/', router);
  }
};

/**
 * Route for confirm page
 */
router.get('/c', function (req, res, next) {
  var code = req.query.code;
  if(!code) {
    return res.status(400).send('Contact id is not set!');
  }
  var contact, event;
  Contact.where({_id: code}).findOneQ()
    .then(function(contactModel) {
      contact = contactModel;
      //get event id from parse object
      var eventId = contact.toObject()._p_event ?
        contact.toObject()._p_event.split("$")[1] : contact.event;
      return Event.where({_id: eventId}).findOneQ()
    })
    .then(function(eventModel) {
      event = eventModel;
      var _EventPlace = new EventPlace();
      //get eventPlace id from parse object
      var eventPlace = event.toObject()._p_eventPlace ?
        event.toObject()._p_eventPlace.split("$")[1] : event.eventPlace;
      return _EventPlace.getEventPlace(eventPlace, event.showBanner);
    })
    .then(function(eventPlace) {
      var data = {
        'contactId': contact.id,
        'contactName': contact.name,
        'brideName': event.brideName,
        'groomName': event.groomName,
        'image': event.image ?
        parseServer.filePath + parseServer.appId + '/' + event.image : '',
        'date': moment(event.date).format(dateFormats.confirmFormat),
        'dateLink': DateLink.getDateLink(event),
        'location': event.location,
        'locationLink': event.locationLink,
        'placeName': eventPlace.name,
        'placeUrl': eventPlace.url,
        'showBanner': event.showBanner,
        'maxNumberOfGuests': event.maxNumberOfGuests,
        'status': contact.status,
        'guest': contact.numberOfGuests
      };

      res.render('confirm.html', {
        data: data
      });
    })
    .catch(function(err) {
      next(err);
    });
});

/**
 * Route for test confirm page
 */
router.get('/e', function (req, res, next) {
  var eventId = req.query.eventId;
  if(!eventId) {
    return res.status(400).send('Event id is not set!');
  }
  var event;
  Event.where({_id: eventId}).findOneQ()
    .then(function(eventModel) {
      event = eventModel;
      var _EventPlace = new EventPlace();
      //get eventPlace id from parse object
      var eventPlace = event.toObject()._p_eventPlace ?
        event.toObject()._p_eventPlace.split("$")[1] : event.eventPlace;
      return _EventPlace.getEventPlace(eventPlace, event.showBanner);
    })
    .then(function(eventPlace) {
      var data = {
        'contactId': null,
        'contactName': 'אורח',
        'brideName': event.brideName,
        'groomName': event.groomName,
        'image': event.image ?
        parseServer.filePath + parseServer.appId + '/' + event.image : '',
        'date': moment(event.date).format(dateFormats.confirmFormat),
        'dateLink': DateLink.getDateLink(event),
        'location': event.location,
        'locationLink': event.locationLink,
        'placeName': eventPlace.name,
        'placeUrl': eventPlace.url,
        'showBanner': event.showBanner,
        'status': 3,
        'guest': 1
      };

      res.render('confirm.html', {
        data: data
      });
    })
    .catch(function(err) {
      next(err);
    });
});

router.post('/change-status', function(req, res, next) {
  //updated from confirm page
  const CONTACT_STATUS_UPDATED_BY = 1;

  var status = req.body.status || null;
  var guest = req.body.guest || null;
  var code = req.body.contact || null;
  var changes = {};

  if (status === null || status === '' || !guest || !code) {
    return res.status(400).send('Required parameters not set');
  }

  Contact.where({_id: code}).findOneQ()
    .then(function(contact) {
      //save contact status log
      changes.contentId = contact.id;
      changes.contentType = contact.__proto__.collection.name;
      changes.action = changesLogReferences.update;
      changes.updatedBy = CONTACT_STATUS_UPDATED_BY;
      changes.details = {};

      if (contact.status != status) {
        changes.details.status = {};
        changes.details.status.old = contact.status;
        changes.details.status.new = status;
      }

      if (contact.numberOfGuests != guest) {
        changes.details.numberOfGuests = {};
        changes.details.numberOfGuests.old = contact.numberOfGuests;
        changes.details.numberOfGuests.new = guest;
      }
      changes.details = JSON.stringify(changes.details);
      contact.status = status;
      contact.numberOfGuests = guest;
      return contact.saveQ();
    })
    .then(function() {
      return new ChangesLog(changes).saveQ();
    })
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(err) {
      next(err);
    })
});