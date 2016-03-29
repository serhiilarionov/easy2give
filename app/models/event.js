'use strict';

var Event = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    Schema = mongoose.Schema;

  //scheme of Event model
  var EventScheme = new Schema({
    date: {type: Date},
    firstWaveSmsText : {type: String},
    secondWaveSmsText : {type: String},
    coupleAlertText : {type: String},
    smsRemindText : {type: String},
    isInstructionSent : {type: Boolean},
    isLimitWaves : {type: Boolean},
    smsAllowed : {type: Boolean},
    callCenter : {type: Date},
    firstWave : {type: Date},
    secondWave : {type: Date},
    ivrDate : {type: Date},
    groomPhone : {type: String},
    bridePhone : {type: String},
    eventStatus: {type: Number},
    coupleId : {type: String, require: true, index: { unique: true }},
    password : {type: String, require: true},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  EventScheme.pre('save', function(next) {
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
  var _model = mongoose.model('Event', EventScheme, "Event");

  return {
    schema : EventScheme,
    model : _model
  }
}();
module.exports = Event;