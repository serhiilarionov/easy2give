'use strict';

var ChangesLog = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of ChangesLog model
  var ChangesLogScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    action : {type: String},
    contentId : {type: String},
    contentType : {type: String},
    details : {type: String},
    updatedBy : {type: Number},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  ChangesLogScheme.pre('save', function(next) {
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
  var _model = mongoose.model('ChangesLog', ChangesLogScheme, "ChangesLog");

  return {
    schema : ChangesLogScheme,
    model : _model
  }
}();
module.exports = ChangesLog;