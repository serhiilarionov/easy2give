'use strict';

var Email = function() {
  var File = require('./file.js'),
    emailConfig = require('../../config/email.js'),
    url = require('../../config/url.js'),
    moment = require('moment'),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(emailConfig.mandrillApiKey),
    mongoose = require('mongoose-promised'),
    ErrorLog = mongoose.model('Error'),
    Template = require('../services/template.js'),
    Promise = require('bluebird');

  /**
   * Send email
   * @param filePath
   * @param subject
   * @param emailList
   * @param paramsList
   */
  var send = function(filePath, subject, emailList, paramsList) {
    for (var param in paramsList) {
      url[param] = paramsList[param];
    }
    //get template for sending
    return Template.getTemplate(filePath, url)
      .then(function(html) {
        var message = {
          'html': html,
          'subject': subject,
          'from_email': emailConfig.fromEmail,
          'from_name': emailConfig.fromName
        };

        //add email list
        emailList.forEach(function(to) {
          if (!to) {
            return;
          }
          if(!message['to']) {
            message['to'] = [];
          }
          message['to'].push({
            'email': to,
            'type': 'to'
          })
        });

        //stop if email list is empty
        if (!message['to'].length) {
          return false;
        }

        var async = false;

        return new Promise(function (resolve, reject) {
          mandrill_client.messages.send({"message": message, "async": async}, function(result) {
            resolve(result);
          }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            reject('A mandrill error occurred: ' + e.name + ' - ' + e.message);
          });
        });

      })
      .then(function(res) {
        var message = moment().format() + ': ' + res.response;
        File.writeToFile('/email-send.log', message);
        return true;
      })
      .catch(function(err){
        new ErrorLog({
          errorStatus: err.status || 500,
          errorMessage: err.message,
          error: err
        }).save();
        File.writeToFile('/error.log', err.message);
        return err;
      });
  };
  return {
    send: send
  }
}();

module.exports = Email;