'use strict';

var Contact = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    contactReferences = require('../../config/contactReferences.js'),
    mongoose = require('mongoose-promised'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of Contact model
  var ContactScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    status: {type: Number},
    numberOfGuests: {type: Number},
    phone: {type: String},
    event: {type: String},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  ContactScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format(dateFormats.format);

    // change the _updated_at field to current date
    this._updated_at = currentDate;

    // if _created_at doesn't exist, add to that field
    if (!this._created_at)
      this._created_at = currentDate;

    next();
  });

  /**
   * Get contats for event
   * @param event
   * @returns {Promise.<T>}
   */
  ContactScheme.methods.getContactForEvent = function getContactForEvent(event) {
    return this.model('Contact').where({
      $or: [{event: event}, {_p_event: 'Event$' + event}],
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

  /**
   * Get contacts for reminder of wedding
   * @param event
   * @returns {Promise.<T>}
   */
  ContactScheme.methods.getContactForWeddingReminder = function getContactForWeddingReminder(event) {
    return this.model('Contact').where({
      $or: [{event: event.id}, {_p_event: 'Event$' + event.id}],
      status: {
        $in: event.smsRemindStatusList}
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