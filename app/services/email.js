'use strict';

var Email = function() {
  var File = require('./file.js'),
    emailConfig = require('../../config/email.js'),
    url = require('../../config/url.js'),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
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