'use strict';

var SmsQueue = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    smsQueueReferences = require('../../config/smsQueueReferences.js'),
    smsEventStateReferences = require('../../config/smsEventStateReferences.js'),
    mongoose = require('mongoose-promised'),
    url = require('../../config/url.js'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of SmsQueue model
  var SmsQueueScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    status: {type: Number},
    phone: {type: String},
    event: {type: String},
    contact: {type: String},
    smsText: {type: String},
    errorText: {type: String},
    waveType: {type: String},
    state: {type: String},
    session: {type: String},
    reason: {type: String},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  SmsQueueScheme.pre('save', function(next) {
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
   * @param session
   * @param state
   * @param reason
   * @returns {Promise.<T>}
   */
  SmsQueueScheme.methods.updateStatus = function updateStatus(session, state, reason) {
    return this.model('SmsQueue').where({
        session: session
      })
      .findOneQ()
      .then(function (sms){
        //don't change status if already delivered
        if (!sms || sms.status == smsEventStateReferences.status['mt_del']) {
          return false;
        }

        //don't save arrived to the mobile status
        if (state == 'mt_ok') {
          return false;
        }
        var text = smsEventStateReferences.message.hasOwnProperty(state) ?
          smsEventStateReferences.message[state] : state;
        var status = smsEventStateReferences.status.hasOwnProperty(state) ?
          smsEventStateReferences.status[state] : state;

        sms.state = text;
        sms.reason = reason;
        if(parseInt(status)) {
          sms.status = parseInt(status);
        }
        return sms.saveQ();
      });
  };

  //the model uses the schema declaration
  var _model = mongoose.model('SmsQueue', SmsQueueScheme, "SmsQueue");

  return {
    schema : SmsQueueScheme,
    model : _model
  }
}();
module.exports = SmsQueue;