'use strict';

var Ivr = function() {
  var cellact = require('../../config/cellact.js'),
    contactReferences = require('../../config/contactReferences.js'),
    changesLogReferences = require('../../config/changesLogReferences.js'),
    preparePhone = require('./preparePhone.js'),
    url = require('../../config/url.js'),
    Curl = require('node-libcurl').Curl,
    File = require('./file.js'),
    moment = require('moment'),
    mongoose = require('mongoose-promised'),
    Contact = mongoose.model('Contact'),
    Event = mongoose.model('Event'),
    ChangesLog = mongoose.model('ChangesLog'),
    ffmpeg = require('ffmpeg'),
    querystring = require("querystring"),
    Promise = require('bluebird');

  const RECORD_PATH = ':3000/ivr/mp3/';
  const RECORD_NAME = 'record.mp3';
  /**
   * Save response from IVR service
   * @param contactId
   * @param response
   */
  var saveResponse = function(contactId, response) {
    //updated from confirm page
    const CONTACT_STATUS_UPDATED_BY = 1;
    var changes = {};

    return Contact.where({
      _id: contactId
    }).findOneQ()
      .then(function(contact) {
        //transform ivr status to system status
        var numberOfGuests = 0;
        var status;

        if(response > 0) {
          status = contactReferences.statusConfirmed;
          numberOfGuests = response;
        }
        else {
          status = contactReferences.statusNotComing;
        }
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

        if (contact.numberOfGuests != numberOfGuests) {
          changes.details.numberOfGuests = {};
          changes.details.numberOfGuests.old = contact.numberOfGuests;
          changes.details.numberOfGuests.new = numberOfGuests;
        }
        changes.details = JSON.stringify(changes.details);
        contact.status = status;
        contact.numberOfGuests = numberOfGuests;

        return contact.saveQ();
      })
      .then(function() {
        return new ChangesLog(changes).saveQ();
      })
  };

  /**
   * Get record and redirect request to record
   * @param contactId
   */
  function redirectToRecord(contactId) {
    return Contact.where({
      _id: contactId
    }).findOneQ()
      .then(function(contact) {
        var eventId = contact.toObject()._p_event ?
          contact.toObject()._p_event.split("$")[1] : contact.event;
        return Event.where({
          _id: eventId,
          ivrRecordFile: {$exists: true, $ne: null}
        }).findOneQ()
      })
      .then(function(event){
        if(event) {
          return RECORD_PATH + event.id + '/' + RECORD_NAME;
        }
        return false;
      })
  }

  /**
   * Convert record to mp3 format
   * @param recordFile
   * @param outputFile
   */
  function convertRecord(recordFile, outputFile) {
    var process = new ffmpeg(recordFile);
    return process.then(function(audio) {
      return new Promise(function(resolve, reject) {
        audio
          .setAudioChannels(2)
          .setAudioBitRate(128)
          .save(outputFile, function(error, file) {
            if (error) {
              reject(error);
            }
            resolve(true);
          });
      })
    });
  }

  /**
   * Send request to IVR service
   * @param phone
   * @param contactId
   */
  function send(phone, contactId) {
    var url = 'http://www.micropay.co.il/ExtApi/ScheduleVms.php';
    phone = preparePhone(phone);

    var param = {
      'get': 1,
      'uid': 3590,
      'un': 'mickey',
      'desc': 'Test',
      'from': '0722737082',
      'list': phone,
      'sid': '38574',
      'retry': 2,
      'retryint': 1,
      'amd': 3,
      'data': contactId
    };

    return makeGetRequest(url, param);
  }

  /**
   * Make GET request to the service
   * @param url
   * @param param
   */
  var makeGetRequest = function(url, param) {
    return new Promise(function(resolve, reject) {
      if(!url) {
        url = 'http://la.cellactpro.com/http_req.asp';
      }
      url += '?' + querystring.stringify(param);

      var curl = new Curl();
      curl.setOpt('URL', url);
      curl.on('end', function(statusCode, body, headers) {
        var message = moment().format() + ': ' + statusCode + ' ' + body;
        File.writeToFile('/ivr-send.log', message);
        this.close();
        resolve(body);
      });
      curl.on('error', function(err, errCode) {
        File.writeToFile('/ivr-send.log', err.message);
        this.close();
        reject(err);
      });
      curl.perform();
    });
  };

    return {
    saveResponse: saveResponse,
    redirectToRecord: redirectToRecord,
    convertRecord: convertRecord,
    send: send
  }
}();

module.exports = Ivr;