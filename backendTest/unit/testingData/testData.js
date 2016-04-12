'use strict';

/**
 * Тестовые данные
 */
var moment = require('moment'),
  fs = require('fs'),
  shortid = require('shortid'),
  dateFormats = require('../../../config/dateFormats.js');

var now = moment().format(dateFormats.format);
var tomorrow = moment().add('1', 'd').format(dateFormats.format);
var afterTwoWeeks = moment().add('14', 'd').format(dateFormats.format);
var yesterday = moment().subtract('1', 'd').format(dateFormats.format);
var twoDaysAgo = moment().subtract('2', 'd').format(dateFormats.format);
var threeDaysAgo = moment().subtract('3', 'd').format(dateFormats.format);
var lastWeek = moment().subtract('7', 'd').format(dateFormats.format);
var testImg = {
  //data: fs.readFileSync(process.env.PWD + '/www/easy2give/public/img/logo.png'),
  contentType: 'image/png'
  };

var testData = {
  now: now,
  url: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  //dbPath: 'mongodb://localhost:27017/easy2give-development',
  dbPath: 'mongodb://188.166.89.130:27017/easy2give-test',
  Event: {
    coupleId: 'test',
    password: 'test',
    eventStatus: 2,
    smsAllowed: true,
    date: afterTwoWeeks,
    firstWave: now,
    secondWave: now,
    callCenter: yesterday,
    showBanner : true,
    smsRemind : true,
    smsRemindDate : now,
    smsRemindStatusList: [1,2],
    groomPhone: '123123123',
    callRSVP: true,
    isInstructionSent: false,
    paymentDone: false,
    groomEmail: 'serhiilarionov@gmail.com',
    ivrAllowed: true,
    ivrRecordFile: true,
    _created_at: twoDaysAgo
  },
  EventWithOutWaves: {
    date: afterTwoWeeks,
    smsAllowed: true,
    groomPhone: '123123123'
  },
  EventThreeDaysAgo: {
    secondWave: threeDaysAgo,
    ivrAllowed: true,
    ivrRecordFile: true
  },
  EventYesterday: {
    coupleId: 'test',
    password: 'test',
    eventStatus: 2,
    smsAllowed: true,
    date: lastWeek,
    firstWave: yesterday,
    secondWave: yesterday,
    callCenter: yesterday,
    showBanner : true,
    smsRemind : true,
    smsRemindDate : now,
    smsRemindStatusList: [1,2],
    groomPhone: '123123123',
    callRSVP: true,
    isInstructionSent: false,
    paymentDone: false,
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
    _created_at: lastWeek,
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
    status: 0,
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
    details: '{}'
  },
  modelName: 'Error',
  waveType: 'firstWave',
  ivrResponse: 2,
  confirmStatusMaybe: 2,
  guestsNumber: 5
};

module.exports = testData;
