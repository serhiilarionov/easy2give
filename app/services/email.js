'use strict';

var Email = function() {
  var File = require('./file.js'),
    emailConfig = require('../../config/email.js'),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
    Template = require('../services/template.js'),
    Promise = require('bluebird');

  /**
   * Send email
   * @param filePath
   * @param subject
   * @param emailList
   * @param paramList
   */
  var send = function(filePath, subject, emailList, paramList) {
    //get template for sending
    return Template.getTemplate(filePath, paramList)
      .then(function(html) {
        // create reusable transporter object and promisify him
        var transporter = Promise.promisifyAll(nodemailer.createTransport(emailConfig.transport));
        // setup e-mail data with unicode symbols
        var mailOptions = {
          from: emailConfig.from, // sender address
          to: emailList, // list of receivers
          subject: subject, // Subject line
          html: html // html body
        };

        return transporter.sendMail(mailOptions);
      })
      .then(function(res) {
        var message = moment().format() + ': ' + res.response;
        File.writeToFile('/email-send.log', message);
        return true;
      })
      .catch(function(err){
        File.writeToFile('/email-send.log', err.message);
        return err;
      });
  };
  return {
    send: send
  }
}();

module.exports = Email;