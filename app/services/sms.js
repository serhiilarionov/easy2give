'use strict';

var Sms = function() {
  var cellact = require('../../config/cellact.js'),
    url = require('../../config/url.js'),
    File = require('./file.js'),
    Curl = require( 'node-libcurl' ).Curl,
    moment = require('moment'),
    mongoose = require('mongoose-promised'),
    Promise = require('bluebird');

  /**
    * Send sms
    * @param recipient
    * @param content
    * @param confirmUrl
  */
  var send = function(recipient, content, confirmUrl) {
    confirmUrl = confirmUrl || url.confirmUrl;
    var XMLString = '<PALO>' +
      '<HEAD>' +
      '<FROM>' + cellact.company + '</FROM>' +
      '<APP USER="' + cellact.user + '" PASSWORD="' + cellact.password + '">' + cellact.app + '</APP>' +
      '<CMD>sendtextmt</CMD>' +
      '<CONF_LIST><TO TECH="post">' + confirmUrl + '</TO></CONF_LIST>' +
      '</HEAD>' +
      '<BODY>' +
      '<SENDER>' + cellact.sender + '</SENDER>' +
      '<CONTENT><![CDATA[' + content + ']]></CONTENT>' +
      '<DEST_LIST><TO>' + recipient + '</TO></DEST_LIST>' +
      '</BODY>' +
      '<OPTIONAL><MSG_ID>1123527</MSG_ID></OPTIONAL>' +
      '</PALO>';
    return doPostRequestCURL(XMLString)
  };

  /**
   * Send post request to cellact
   * @param XMLString
   */
  var doPostRequestCURL = function(XMLString) {
    return new Promise(function(resolve, reject) {
      var curl = new Curl();
      curl.setOpt('URL', cellact.url);
      curl.setOpt(Curl.option.HTTPHEADER, ['Content-type: application/x-www-form-urlencoded']);
      XMLString = encodeURIComponent(XMLString);
      curl.setOpt(Curl.option.POST, 1);
      curl.setOpt(Curl.option.POSTFIELDS, "XMLString=" + XMLString);

      curl.on('end', function(statusCode, body, headers) {
        var message = moment().format() + ': ' + statusCode + ' ' + body;
        File.writeToFile('/sms-send.log', message);
        this.close();
        var response = {};
        response['statusCode'] = statusCode;
        response['body'] = body;
        resolve(response);
      });
      curl.on('error', function(err, errCode) {
        File.writeToFile('/sms-send.log', err.message);
        this.close();
        reject(err);
      });
      curl.perform();
    });
  };

  return {
    send: send
  }
}();

module.exports = Sms;