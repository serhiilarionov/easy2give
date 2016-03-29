'use strict';

var Contact = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    contactReferences = require('../../config/contactReferences.js'),
    mongoose = require('mongoose-promised'),
    Schema = mongoose.Schema;

  //scheme of Contact model
  var ContactScheme = new Schema({
    status: {type: Number},
    phone: {type: String},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  ContactScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format(dateFormats.format);

    // change the updatedAt field to current date
    this.updatedAt = currentDate;

    // if createdAt doesn't exist, add to that field
    if (!this.createdAt)
      this.createdAt = currentDate;

    next();
  });

  /**
   * Get contats for event
   * @param event
   * @returns {Promise.<T>}
   */
  ContactScheme.methods.getContactForEvent = function getContactForEvent(event) {
    return this.model('Contact').where({
      event: event,
      status: {
        $in: [
          contactReferences.statusNotResponded,
          contactReferences.statusMaybe
        ]}
      })
      .findQ()
      .then(function (contacts){
        return contacts;
      });
  };

  //the model uses the schema declaration
  var _model = mongoose.model('Contact', ContactScheme, "Contact");

  return {
    schema : ContactScheme,
    model : _model
  }
}();
module.exports = Contact;