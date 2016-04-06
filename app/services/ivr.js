'use strict';

var Ivr = function() {
  var cellact = require('../../config/cellact.js'),
    contactReferences = require('../../config/contactReferences.js'),
    changesLogReferences = require('../../config/changesLogReferences.js'),
    preparePhone = require('./preparePhone.js'),
    url = require('../../config/url.js'),
    moment = require('moment'),
    mongoose = require('mongoose-promised'),
    Contact = mongoose.model('Contact'),
    Event = mongoose.model('Event'),
    ChangesLog = mongoose.model('ChangesLog'),
    ffmpeg = require('ffmpeg'),
    Promise = require('bluebird');

  const RECORD_PATH = '/ivr/mp3/';
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
        return Event.where({
          _id: contact.event,
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

  return {
    saveResponse: saveResponse,
    redirectToRecord: redirectToRecord,
    convertRecord: convertRecord
  }
}();

module.exports = Ivr;