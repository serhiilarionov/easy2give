var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  EventPlace = mongoose.model('EventPlace'),
  ChangesLog = mongoose.model('ChangesLog'),
  changesLogReferences = require('../../config/changesLogReferences.js'),
  locationReferences = require('../../config/locationReferences.js'),
  moment = require('moment'),
  url = require('../../config/url.js'),
  dateFormats = require('../../config/dateFormats.js');

module.exports = {
  controller: function (app) {
    app.use('/', router);
  }
};

router.get('/p', function (req, res, next) {
  var eventPlaceId = req.query.eventPlaceId;
  var showBanner = (typeof req.query.banner != 'undefined');

  if (!eventPlaceId) {
    return res.status(400).send('Link ID is not set!');
  }

  EventPlace.where({_id: eventPlaceId}).findOneQ()
    .then(function(eventPlace) {
      var data = {
        'objectId': eventPlace.id,
        'venueAddress': eventPlace.venueAddress,
        'venueLocationLatitude': eventPlace.venueLocation[locationReferences.latitude],
        'venueLocationLongitude': eventPlace.venueLocation[locationReferences.longitude],
        //'venueLogo': eventPlace.venueLogo ? eventPlace.venueLogo.getUrl() : '',
        'venueName': eventPlace.venueName,
        'venuePhone': eventPlace.venuePhone,
        'showBanner': showBanner
      };

      res.render('eventPlace.html', {
        data: data
      });
    })
    .catch(function(err) {
      next(err);
    });
});