'use strict';

var Event = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
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
    callCenter : {type: Date},
    firstWave : {type: Date},
    secondWave : {type: Date},
    ivrDate : {type: Date},
    coupleId : {type: String, require: true, index: { unique: true }},
    password : {type: String, require: true, index: { unique: true }},
    created_at: {type: Date},
    updated_at: {type: Date}
  });

  EventScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
      this.created_at = currentDate;

    next();
  });
  //the model uses the schema declaration
  var _model = mongoose.model('Event', EventScheme, "Event");
  //var Test = new _model({coupleId:'test', password:'test'});
  //Test.save();


  return {
    schema : EventScheme,
    model : _model
  }
}();
module.exports = Event;