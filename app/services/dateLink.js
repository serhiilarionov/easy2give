'use strict';

var DateLink = function() {
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js');

  /**
   *  Prepare date link for google calendar
   * @param event
   * @return string
   */
  var getDateLink = function(event) {
    var dateValue = moment(event.date).format(dateFormats.forGoogleCalendar);
    return "https://www.google.com/calendar/event?" +
    "action=TEMPLATE" +
    "&text=" + "האירוע של " + event.brideName + " ו-" + event.groomName +
    "&dates=" + dateValue + "/" + dateValue +
    "&details=" + "האירוע של " + event.brideName + " ו-" + event.groomName +
    "&location=" + event.location +
    "&trp=false" +
    "&sprop=" +
    "&sprop=name:";
  };

  return {
    getDateLink: getDateLink
  }
}();

module.exports = DateLink;