'use strict';

var ChangesLog = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    Schema = mongoose.Schema;

  //scheme of ChangesLog model
  var ChangesLogScheme = new Schema({
    action : {type: String},
    contentId : {type: String},
    contentType : {type: String},
    details : {type: String},
    updatedBy : {type: Number},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  ChangesLogScheme.pre('save', function(next) {
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
  var _model = mongoose.model('ChangesLog', ChangesLogScheme, "ChangesLog");

  return {
    schema : ChangesLogScheme,
    model : _model
  }
}();
module.exports = ChangesLog;