'use strict';

var ErrorLog = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    mongoose = require('mongoose-promised'),
    Schema = mongoose.Schema;

  //scheme of Error model
  var ErrorScheme = new Schema({
    errorStatus: {type: Number},
    errorMessage: {type: String},
    error: {type: String},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  ErrorScheme.pre('save', function(next) {
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
  var _model = mongoose.model('Error', ErrorScheme, "Error");

  return {
    schema : ErrorScheme,
    model : _model
  }
}();
module.exports = ErrorLog;