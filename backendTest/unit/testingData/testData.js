'use strict';

/**
 * Тестовые данные
 */
var moment = require('moment'),
  fs = require('fs'),
  dateFormats = require('../../../config/dateFormats.js');

var now = moment().format(dateFormats.format);
var tomorrow = moment().add('1', 'd').format(dateFormats.format);
var lastWeek = moment().subtract('7', 'd').format(dateFormats.format);
var testImg = {
  //data: fs.readFileSync(process.env.PWD + '/www/easy2give/public/img/logo.png'),
  contentType: 'image/png'
  };
var testData = {
  now: now,
  url: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  dbPath: 'mongodb://localhost:27017/easy2give-development',
  Event: {
    coupleId: 'test',
    password: 'test',
    eventStatus: 0,
    smsAllowed: true,
    date: lastWeek,
    firstWave: now,
    secondWave: now,
    callCenter: now,
    showBanner : true,
    smsRemind : true,
    smsRemindStatusList: [1,2],
    groomPhone: '123123123',
    callRSVP: true,
    isInstructionSent: false,
    paymentDone: true,
    groomEmail: 'serhiilarionov@gmail.com',
    ivrAllowed: true,
    ivrRecordFile: true
  },
  EventLastWeek: {
    coupleId: 'test',
    password: 'test',
    eventStatus: 0,
    smsAllowed: true,
    date: lastWeek,
    firstWave: tomorrow,
    secondWave: tomorrow,
    callCenter: tomorrow,
    showBanner : true,
    smsRemind : true,
    smsRemindStatusList: [1,2],
    groomPhone: '123123123',
    callRSVP: true,
    createdAt: lastWeek,
    groomEmail: 'serhiilarionov@gmail.com',
    isInstructionSent: false
  },
  EventPlace: {
    venueName: 'test',
    venueAddress: '234234234',
    venuePhone: '123',
    venueLocation: [23, 24],
    venueLogo: testImg
  },
  Contact: {
    status: 1,
    phone: '123123123'
  },
  SmsQueue: {
    status: 0,
    phone: '123123123',
    session : '37f289e3-dca5-436a-8ddc-28257507d48a'
  },
  IvrQueue: {
    phone: '123123123'
  },
  smsSession: "37f289e3-dca5-436a-8ddc-28257507d48a",
  smsState: 'mt_nok',
  smsReason: '7000',
  ErrorLog: {
    errorStatus: 500,
    errorMessage: 'test'
  },
  paramsList: {
    coupleId: 'coupleId',
    password: 'password'
  },
  Sms: {
    Template: {
      name: 'test',
      text: 'Hello'
    },
    phoneNumber: '123123123'
  },
  Email: {
    template: './public/templates/email/instruction.html',
    subject: 'test',
    mailList: 'serhiilarionov@gmail.com'
  },
  ChangesLog: {
    action: 'create',
    contentId: '56fbc282679ad4203e85cf85',
    contentType: 'Event',
    details: '{}'
  },
  modelName: 'Error',
  waveType: 'firstWave',
  ivrResponse: 2
};

module.exports = testData;
