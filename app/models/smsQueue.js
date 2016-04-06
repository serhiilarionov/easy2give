'use strict';

var SmsQueue = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    smsQueueReferences = require('../../config/smsQueueReferences.js'),
    smsEventStateReferences = require('../../config/smsEventStateReferences.js'),
    mongoose = require('mongoose-promised'),
    url = require('../../config/url.js'),
    Schema = mongoose.Schema;

  //scheme of SmsQueue model
  var SmsQueueScheme = new Schema({
    status: {type: Number},
    phone: {type: String},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    contact: {type: Schema.Types.ObjectId, ref: 'Contact'},
    smsText: {type: String},
    errorText: {type: String},
    waveType: {type: String},
    state: {type: String},
    reason: {type: String},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  SmsQueueScheme.pre('save', function(next) {
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