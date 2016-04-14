'use strict';

var check = function() {
  var fs = require('fs'),
    cellact = require('../../config/cellact.js'),
    url = require('../../config/url.js'),
    mongoose = require('mongoose-promised'),
    eventReferences = require('../../config/eventReferences.js'),
    smsQueueReferences = require('../../config/smsQueueReferences.js'),
    SmsQueue = mongoose.model('SmsQueue'),
    Template = mongoose.model('Template');

  /**
   * Check on empty content
   * @param model
   * @param fields
   */
  var onEmptyContent = function(model, fields) {
    var errors = [];
    Object.keys(fields).forEach(function(key) {
      if(!model[fields[key]] || model[fields[key]] === '') {
        errors.push(fields[key]);
      }
    });

    return errors;
  };

  return {
    onEmptyContent: onEmptyContent
  }
}();

module.exports = check;