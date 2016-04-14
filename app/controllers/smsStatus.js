var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  EventPlace = mongoose.model('EventPlace'),
  ChangesLog = mongoose.model('ChangesLog'),
  SmsQueue = mongoose.model('SmsQueue'),
  changesLogReferences = require('../../config/changesLogReferences.js'),
  clearOldData = require('../services/clearOldData.js'),
  cron = require('../services/cron.js'),
  File = require('../services/file.js'),
  moment = require('moment'),
  url = require('../../config/url.js'),
  smsEventReferences = require('../../config/smsEventReferences.js'),
  Promise = require("bluebird"),
  fs = Promise.promisifyAll(require('fs')),
  dateFormats = require('../../config/dateFormats.js'),
  parserXML = require('xml2json');
  _ = require('lodash');
var multiparty = require('multiparty');

module.exports = {
  controller: function (app) {
    app.use('/', router);
  }
};

/**
 * Route for receiving response from sms service
 * @param contactId
 * @param response
 */
router.get('/sms-status', function(req, res, next) {
  var xmlData = req.query.CONFIRMATION || null;
  var json = parserXML.toJson(xmlData);
  var data = JSON.parse(json).PALO;

  var info = moment().format(dateFormats.format) + ': ' + json;
  File.writeToFile('/sms-status.log', info);

  if (data.hasOwnProperty('BLMJ') && data.hasOwnProperty('EVT')) {
    var reason = data.hasOwnProperty('REASON') ? data.REASON : '';
    var _SmsQueue = new SmsQueue();
    _SmsQueue.updateStatus(data['BLMJ'], data['EVT'], reason);
  }
});

