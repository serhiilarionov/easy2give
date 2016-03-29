var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Sms = require('../services/sms.js'),
  Email = require('../services/email.js'),
  clearOldData = require('../services/clearOldData.js'),
  cron = require('../services/cron.js'),
  moment = require('moment'),
  url = require('../../config/url.js'),
  _ = require('lodash');

module.exports = {
  controller: function (app) {
    app.use('/', router);
  }
};

router.get('/', function (req, res, next) {
  Event
    .where()
    .findQ()
    .then(function(events) {
      res.render('index', {
        title: 'Generator-Express MVC',
        events: events
      });
    })
    .catch(function(err){
      next(err);
    })
});

