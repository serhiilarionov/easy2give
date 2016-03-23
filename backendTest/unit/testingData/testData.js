'use strict';

/**
 * Тестовые данные
 */

var testData = {
  url: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  dbPath: 'mongodb://localhost/easy2give-development',
  Event: {
    coupleId: "test",
    password: "test"
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
