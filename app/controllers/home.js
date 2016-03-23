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

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Event
    .where()
    .findQ()
    .then(function(events) {
      var paramList = {
        coupleId: 'coupleId',
        password: 'password'
      };
      paramList = _.merge(paramList, url);
      var subject = 'node test';
      var mailList = 'serhiilarionov@gmail.com';
      //Sms.send('0533363561', 'instruction', paramList);
      //Email.send('./public/templates/email/instruction.html', subject, mailList, paramList);
      //var now = moment().format();
      //clearOldData('Error', now);
      //Sms.send('0533363561', 'instruction', paramList)
      //  .then(function(res) {
      //    console.log(res);
      //  });


      res.render('index', {
        title: 'Generator-Express MVC',
        events: events
      });
    })
    .catch(function(err){
      next(err);
    })
});

