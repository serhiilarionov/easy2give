var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  ErrorLog = mongoose.model('Error'),
  SmsQueueService = require('../../services/smsQueue.js'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  smsQueueReferences = require('../../../config/smsQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  File = require('../../services/file.js'),
  _ = require('lodash'),
  env = process.env.NODE_ENV || 'development';

var waves = function () {
  const FIRST_WAVE_FIELD = 'firstWave';
  const SECOND_WAVE_FIELD = 'secondWave';

  /**
   * Notify about start the wave
   * @param waveType
   * @param date
   * @returns {Promise.<T>}
   */
  var notifyWave = function(waveType, date) {
    var where = {};
    //where[waveType] = {"$lt": date};
    where[waveType] = date;
    where['smsAllowed'] = true;
    return Event
      .where(where)
      .findQ()
      .then(function(events) {
        var promises = [];
        var _Contact = new Contact();

        events.forEach(function(event) {
          var paramsList = {
            coupleId: event.coupleId,
            password: event.password
          };

          promises.push(
          //alert to couple that wave was started
          SmsQueueService.sendCoupleSms(event, waveType, paramsList)
            .then(function() {
              event.eventStatus = (_.invert(eventReferences.eventStatuses))
                [eventReferences.eventWavesTypes[waveType][eventReferences.waveStatus.start]];
              return event.saveQ();
            })
            .then(function() {
              return _Contact.getContactForEvent(event);
            })
            .then(function(contacts) {
              return {
                contacts:contacts,
                event: event
              };
            })
          );
        });
        return Promise.each(promises, function(promise) {
          promise.contacts.forEach(function(contact) {
            var link = contact.id;
            var phone = contact.phone;
            var smsText = '';
            if(link && phone) {
              if (waveType == FIRST_WAVE_FIELD) {
                smsText = promise.event['firstWaveSmsText'];
              } else {
                smsText = promise.event['secondWaveSmsText'];
              }
              smsText += ' ' + link;

              var sms = {};
              sms.event = promise.event;
              sms.waveType = waveType;
              sms.status = smsQueueReferences.wait;
              sms.smsText = smsText;
              sms.phone = phone;
              new SmsQueue(sms).saveQ();
            }
          });
        });
      })
      .catch(function(err) {
        new ErrorLog({
          errorStatus: err.status || 500,
          errorMessage: err.message,
          error: err
        }).save();
        File.writeToFile('/error.log', err.message);
        return err;
      });
  };

  /**
   * Start the first wave
   * @param req
   * @param res
   * @param next
   */
  var firstWave = function (req, res, next) {
    var now = moment().format(dateFormats.format);
    notifyWave(FIRST_WAVE_FIELD, now)
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  /**
   * Start the second wave
   * @param req
   * @param res
   * @param next
   */
  var secondWave = function (req, res, next) {
    var now = moment().format(dateFormats.format);
    notifyWave(SECOND_WAVE_FIELD, now)
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    notifyWave : notifyWave,
    firstWave : firstWave,
    secondWave : secondWave
  }
}();

if(env === 'development') {
  router.get('/cron/waves/firstWave', waves.firstWave);
  router.get('/cron/waves/secondWave', waves.secondWave);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  waves: waves
};


///**
// * Get events for IVR notification
// * @param \DateTime $date
// * @return \Parse\ParseObject[]
// */
//public function getIVREvent(\DateTime $date)
//{
//  $ivrDate = clone $date;
//  $ivrDate->modify("-3 hours");
//  $query = new ParseQuery('Event');
//  $query->limit(1000);
//  $query->equalTo('secondWave', $ivrDate);
//  $query->equalTo('ivrAllowed', true);
//  $query->equalTo('ivrRecordFile', true);
//
//  return $query->find();
//}
//
///**
// * Send IVR notify for each contact in event list
// * @param $eventList
// * @throws \Exception
// */
//public function notifyIVR($eventList)
//{
//  foreach ($eventList as $event) {
//
//  //change status that IVR started
//  $event->set('eventStatus', $this->eventStatusListReverse[self::IVR_STARTED]);
//  $event->save();
//
//  //filter contact. send only for not sent contacts
//  $contactList = $this->getContactForEvent($event);
//
//  foreach ($contactList as $contact) {
//
//    $phone = $this->preparePhone($contact->get('phone'));
//    if ($phone) {
//
//      //send ivr
//      $response = $this->sendIVR($phone, $contact->getObjectId());
//
//      //update status
//      $status = $response['success'] ? self::SMS_STATUS_SENT : self::SMS_STATUS_ERROR;
//      $this->updateContactWaveStatus($contact, $status, 'ivr');
//
//      //write log
//      $this->logSmsStatus($event, $contact, 'IVR', $phone, '', $status, $response['errorText'], $response['session']);
//
//    } else {
//
//    }
//  }
//
//  //change status that IVR finished
//  $event->set('eventStatus', $this->eventStatusListReverse[self::IVR_DONE]);
//  $event->save();
//}
//}
