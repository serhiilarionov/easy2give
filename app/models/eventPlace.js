'use strict';

var EventPlace = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    dateFormats = require('../../config/dateFormats.js'),
    url = require('../../config/url.js'),
    Schema = mongoose.Schema;


  //scheme of EventPlace model
  var EventPlaceScheme = new Schema({
    venueAddress: {type: String},
    venueLocation : { type: [Number], index: '2dsphere'},
    venueLogo : { data: Buffer, contentType: String },
    venueName : {type: String},
    venuePhone : {type: String}
  });

  EventPlaceScheme.pre('save', function(next) {
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