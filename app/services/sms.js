'use strict';

var Sms = function() {
  var fs = require('fs'),
    cellact = require('../../config/cellact.js'),
    url = require('../../config/url.js').confirmUrl,
    File = require('./file.js'),
    Curl = require( 'node-libcurl' ).Curl,
    moment = require('moment'),
    mongoose = require('mongoose-promised'),
    Template = mongoose.model('Template');

  /**
    * Send sms
    * @param recipient
    * @param contentType
    * @param confirmUrl
    * @param paramList
  */
  var send = function(recipient, contentType, paramList, confirmUrl) {
    confirmUrl = confirmUrl || url;
    return getContent(contentType, paramList)
      .then(function(content) {
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
      })
      .then(function(res){
        return res;
      })
      .catch(function(err) {
        return err;
      });
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
        resolve(true);
      });
      curl.on('error', function(err, errCode) {
        File.writeToFile('/sms-send.log', err.message);
        this.close();
        reject(err);
      });
      curl.perform();
    });
  };

  /**
   * Get content for sms by contentType
   * @param contentType
   * @param paramList
   * @returns {Promise.<T>}
   */
  var getContent = function(contentType, paramList) {
    return Template.where({name: contentType})
      .findOneQ()
      .then(function (template){
        for(var index in paramList) {
          var re = new RegExp("%"+index+"%","g");
          template.text = template.text.replace(re, paramList[index]);
        }
        return template.text;
      })
      .catch(function (err) {
        return err;
      });
  };

  return {
    send : send
  }
}();

module.exports = Sms;