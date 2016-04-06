'use strict';

var Event = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    filePluginLib = require('mongoose-file'),
    path = require('path'),
    filePlugin = filePluginLib.filePlugin,
    make_upload_to_model = filePluginLib.make_upload_to_model,
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
    groomPhone : {type: String},
    bridePhone : {type: String},
    groomEmail : {type: String},
    brideEmail : {type: String},
    eventStatus: {type: Number},
    smsRemindStatusList: {type: Array},
    eventPlace: {type: Schema.Types.ObjectId, ref: 'EventPlace'},
    coupleId : {type: String, require: true, index: { unique: true }},
    password : {type: String, require: true},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  var uploads_base = path.join(__dirname, "uploads");
  var uploads = path.join(uploads_base, "u");
  EventScheme.plugin(filePlugin, {
    name: "file",
    upload_to: make_upload_to_model(uploads, 'file'),
    relative_to: uploads_base
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