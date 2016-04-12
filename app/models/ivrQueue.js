'use strict';

var IvrQueue = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    mongoose = require('mongoose-promised'),
    url = require('../../config/url.js'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of IvrQueue model
  var IvrQueueScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    status: {type: Number},
    phone: {type: String},
    event: {type: String},
    contact: {type: String},
    state: {type: String},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  IvrQueueScheme.pre('save', function(next) {
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
  var _model = mongoose.model('IvrQueue', IvrQueueScheme, "IvrQueue");

  return {
    schema : IvrQueueScheme,
    model : _model
  }
}();
module.exports = IvrQueue;