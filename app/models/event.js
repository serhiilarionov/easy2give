'use strict';

var Event = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    path = require('path'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of Event model
  var EventScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    date: {type: Date},
    firstWaveSmsText : {type: String},
    secondWaveSmsText : {type: String},
    coupleAlertText : {type: String},
    smsRemindText : {type: String},
    isInstructionSent : {type: Boolean},
    isLimitWaves : {type: Boolean},
    smsAllowed : {type: Boolean},
    ivrAllowed : {type: Boolean},
    ivrRecordFile : {type: Boolean},
    callRSVP : {type: Boolean},
    callTeamLimit : {type: Number},
    smsRemind : {type: Boolean},
    smsRemindDate : {type: Date},
    showBanner : {type: Boolean},
    paymentDone : {type: Boolean},
    callCenter : {type: Date},
    firstWave : {type: Date},
    secondWave : {type: Date},
    ivrDate : {type: Date},
    disabledAt : {type: Date},
    image : {type: String},
    location: {type: String},
    locationLink: {type: String},
    groomPhone : {type: String},
    bridePhone : {type: String},
    groomEmail : {type: String},
    brideEmail : {type: String},
    eventStatus: {type: Number},
    smsRemindStatusList: {type: Array},
    eventPlace: {type: String},
    coupleId : {type: String, require: true, index: { unique: true }},
    password : {type: String, require: true},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  EventScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format(dateFormats.format);

    // change the _updated_at field to current date
    this._updated_at = currentDate;

    // if _created_at doesn't exist, add to that field
    if (!this._created_at)
      this._created_at = currentDate;

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