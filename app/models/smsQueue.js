'use strict';

var SmsQueue = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    smsQueueReferences = require('../../config/smsQueueReferences.js'),
    mongoose = require('mongoose-promised'),
    url = require('../../config/url.js'),
    Schema = mongoose.Schema;

  //scheme of SmsQueue model
  var SmsQueueScheme = new Schema({
    status: {type: Number},
    phone: {type: String},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    contact: {type: Schema.Types.ObjectId, ref: 'Contact'},
    smsText: {type: String},
    errorText: {type: String},
    waveType: {type: String},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  SmsQueueScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format(dateFormats.format);

    // change the updatedAt field to current date
    this.updatedAt = currentDate;

    // if createdAt doesn't exist, add to that field
    if (!this.createdAt)
      this.createdAt = currentDate;

    next();
  });

  //the model uses the schema declaration
  var _model = mongoose.model('SmsQueue', SmsQueueScheme, "SmsQueue");

  return {
    schema : SmsQueueScheme,
    model : _model
  }
}();
module.exports = SmsQueue;