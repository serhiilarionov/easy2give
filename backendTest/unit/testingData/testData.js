'use strict';

/**
 * Тестовые данные
 */
var moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js');

var now = moment().format(dateFormats.format);
var testData = {
  now: now,
  url: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  dbPath: 'mongodb://localhost:27017/easy2give-development',
  Event: {
    coupleId: "test",
    password: "test",
    eventStatus: 0,
    smsAllowed: true,
    firstWave: now,
    secondWave: now
  },
  Contact: {
    status: 1
  },
  SmsQueue: {
    status: 0,
    phone: '0533363561'

  },
  ErrorLog: {
    errorStatus: 500,
    errorMessage: "test"
  },
  paramList: {
    coupleId: 'coupleId',
    password: 'password'
  },
  Sms: {
    Template: {
      name: "test",
      text: "Hello"
    },
    phoneNumber: '0533363561'
  },
  Email: {
    template: './public/templates/email/instruction.html',
    subject: 'test',
    mailList: 'serhiilarionov@gmail.com'
  },
  modelName: 'Error'
};

module.exports = testData;
