'use strict';

var EventPlace = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    url = require('../../config/url.js'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;


  //scheme of EventPlace model
  var EventPlaceScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    venueAddress: {type: String},
    venueLocation : { type: [Number], index: '2dsphere'},
    venueLogo : { data: Buffer, contentType: String },
    venueName : {type: String},
    venuePhone : {type: String},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  EventPlaceScheme.pre('save', function(next) {
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
   * Get event place url
   * @param eventPlace
   * @param showBanner
   */
  EventPlaceScheme.methods.getEventPlace = function getEventPlace(eventPlace, showBanner) {
    var banner = showBanner || false;
    var result = {
      name: '',
      url: ''
    };

    if(!eventPlace) {
      return result;
    }

    return this.model('EventPlace').where({_id: eventPlace})
      .findOneQ()
      .then(function(eventPlace) {
        result.url = url.eventPlaceUrl + eventPlace.id;
        if (banner) {
          result.url += '?banner';
        }
        result.name = eventPlace.venueName;
        return result;
      });
  };

  //the model uses the schema declaration
  var _model = mongoose.model('EventPlace', EventPlaceScheme, "EventPlace");

  return {
    schema : EventPlaceScheme,
    model : _model
  }
}();
module.exports = EventPlace;