'use strict';

var smsQueue = function() {
  var fs = require('fs'),
    cellact = require('../../config/cellact.js'),
    url = require('../../config/url.js'),
    mongoose = require('mongoose-promised'),
    Promise = require('bluebird'),
    eventReferences = require('../../config/eventReferences.js'),
    smsQueueReferences = require('../../config/smsQueueReferences.js'),
    SmsQueue = mongoose.model('SmsQueue'),
    Template = mongoose.model('Template');

  /**
   * Send sms to couple (groom and bride)
   * @param waveType
   * @param event
   * @param paramsList
   */
  var sendCoupleSms = function(event, waveType, paramsList) {
    var phoneList = ['groomPhone', 'bridePhone'];
    var phone = false;
    for (var param in paramsList) {
      url[param] = paramsList[param];
    }
    var _Template = new Template();
    return _Template.getContent(waveType, url)
      .then(function(content) {
        var promises = [];
        phoneList.forEach(function(phoneItem) {
          phone = event[phoneItem];
          if (phone) {
            var sms = {};
            sms.event = event.objectId;
            sms.waveType = waveType;
            sms.status = smsQueueReferences.wait;
            sms.smsText = content;
            sms.phone = phone;
            promises.push(new SmsQueue(sms).saveQ())
          }
        });
        return Promise.all(promises);
      })
  };

  return {
    sendCoupleSms: sendCoupleSms
  }
}();

module.exports = smsQueue;