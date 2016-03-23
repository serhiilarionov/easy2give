'use strict';

var ErrorLog = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    Schema = mongoose.Schema;

  //scheme of Error model
  var ErrorScheme = new Schema({
    errorStatus: {type: Number},
    errorMessage: {type: String},
    error: {type: String},
    created_at: {type: Date},
    updated_at: {type: Date}
  });

  ErrorScheme.pre('save', function(next) {
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
  var _model = mongoose.model('Error', ErrorScheme, "Error");
  //var Test = new _model({contentId: 'test', contentType:'test', error:'test'});
  //Test.save();

  return {
    schema : ErrorScheme,
    model : _model
  }
}();
module.exports = ErrorLog;