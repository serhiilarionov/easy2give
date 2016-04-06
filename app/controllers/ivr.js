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
  Promise = require("bluebird"),
  fs = Promise.promisifyAll(require('fs')),
  path = require('path'),
  DateLink = require('../services/dateLink.js'),
  dateFormats = require('../../config/dateFormats.js'),
  ivrService = require('../services/ivr.js'),
  _ = require('lodash');
var multiparty = require('multiparty');

module.exports = {
  controller: function (app) {
    app.use('/', router);
  }
};

/**
 * Route for save record for IVR
 */
router.post('/save-record', function(req, res, next) {
  const RECORD_PATH = '/public/ivr/mp3/';
  const RECORD_NAME = 'record.mp3';

  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (!files.file || !fields.eventId) {
      return res.status(400).send('Data not sent');
    }
    var file = files.file[0] || null;
    var eventId = fields.eventId[0] || null;

    //check file size in MB
    var maxSize = 10;
    if (file.size > 1024 * 1024 * maxSize) {
      return res.status(400).send('File is too large. Max file size is ' + maxSize + 'MB');
    }

    //check file extension
    var ext = path.extname(file.path);
    if (ext != '.mp3' && ext != '.m4a') {
      return res.status(400).send("Error. File extension must be mp3 or m4a format");
    }
    //upload file
    var appDir = process.cwd();
    var tmpPath = RECORD_PATH + eventId + '/record' + ext;
    var uploadPath = appDir + RECORD_PATH + eventId;
    var filePath = appDir + tmpPath;

    if (!fs.existsSync(uploadPath)) {
      // Create the directory if it does not exist
      fs.mkdirSync(uploadPath);
    }
    return fs.readFileAsync(file.path)
      .then(function(data) {
        return fs.writeFileAsync(filePath, data);
      })
      .then(function() {
        if (!fs.existsSync(filePath)) {
          return res.status(400).send("Can't save file. Try again");
        }
        //convert file if not mp3
        if (ext != '.mp3') {
          var resultUploadPath = uploadPath + '/' + RECORD_NAME;
          if (fs.existsSync(resultUploadPath)) {
            fs.unlinkSync(resultUploadPath);
          }
          return ivrService.convertRecord(filePath, resultUploadPath)
            .then(function() {
              //remove old file after converting
              fs.unlinkSync(filePath);
              //get event
              return Event.where({
                _id: eventId
              }).findOneQ()
            })
        }
        //get event
        return Event.where({
          _id: eventId
        }).findOneQ()
      })
      .then(function(event) {
        //save event status
        event.ivrRecordFile = true;
        return event.saveQ();
      })
      .then(function() {
        return res.sendStatus(200);
      })
      .catch(function(err) {
        return res.status(500).send(err);
      });
  });
});

/**
 * Route for getting IVR record
 */
router.get('/ivr-mp3', function(req, res, next) {
  var contactId = req.query.lastnum || null;
  if (!contactId) {
    return res.status(400).send('Contact is not set');
  }
  ivrService.redirectToRecord(contactId)
    .then(function(url) {
      return res.status(200).redirect(url);
    })
    .catch(function(err) {
      next(err)
    });
});

/**
 * Route for receiving response from ivr
 */
router.get('/ivr-responce', function(req, res, next) {
  var contactId = req.query.data1 || null;
  var response = req.query.data2 || null;

  if (!contactId || !response) {
    return;
  }
  ivrService.saveResponse(contactId, response);
});

