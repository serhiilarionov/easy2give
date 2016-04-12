'use strict';

var ErrorLog = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    mongoose = require('mongoose-promised'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of Error model
  var ErrorScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    errorStatus: {type: Number},
    errorMessage: {type: String},
    error: {type: String},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  ErrorScheme.pre('save', function(next) {
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
  var _model = mongoose.model('Error', ErrorScheme, "Error");

  return {
    schema : ErrorScheme,
    model : _model
  }
}();
module.exports = ErrorLog;