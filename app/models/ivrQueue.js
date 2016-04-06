'use strict';

var IvrQueue = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    mongoose = require('mongoose-promised'),
    url = require('../../config/url.js'),
    Schema = mongoose.Schema;

  //scheme of IvrQueue model
  var IvrQueueScheme = new Schema({
    status: {type: Number},
    phone: {type: String},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    contact: {type: Schema.Types.ObjectId, ref: 'Contact'},
    ivrText: {type: String},
    errorText: {type: String},
    waveType: {type: String},
    state: {type: String},
    reason: {type: String},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  IvrQueueScheme.pre('save', function(next) {
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
  var _model = mongoose.model('IvrQueue', IvrQueueScheme, "IvrQueue");

  return {
    schema : IvrQueueScheme,
    model : _model
  }
}();
module.exports = IvrQueue;