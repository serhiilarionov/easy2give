var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  dateFormats = require('../../../config/dateFormats.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  templates = require('../../../config/templates.js'),
  smsQueue = require('../../services/smsQueue.js');

var apiCallCenter = function () {

  var callCenterDoneRoute = function (req, res, next) {
    var event = req.body.event;
    var waveType = req.body.actionName;

    smsQueue.sendCoupleSms(event, waveType, [])
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    callCenterDoneRoute: callCenterDoneRoute
  }
}();

router.post('/api/callCenterDone', apiCallCenter.callCenterDoneRoute);

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  apiCallCenter: apiCallCenter
};