var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose-promised'),
  Promise = require('bluebird'),
  Event = mongoose.model('Event'),
  Contact = mongoose.model('Contact'),
  SmsQueue = mongoose.model('SmsQueue'),
  Sms = require('../../services/sms.js'),
  moment = require('moment'),
  dateFormats = require('../../../config/dateFormats.js'),
  smsQueueReferences = require('../../../config/smsQueueReferences.js'),
  eventReferences = require('../../../config/eventReferences.js'),
  _ = require('lodash'),
  File = require('../../services/file.js'),
  async = require('async'),
  env = process.env.NODE_ENV || 'development';

var send = function () {
  /**
   * Send sms from sms queue
   * @returns {Promise.<T>}
   */
  var sms = function() {
    var where = {};
    where['status'] = smsQueueReferences.wait;
    return SmsQueue
      .where(where)
      .findQ()
      .then(function(smsQueue) {
        var portions = [];
        //array divided into portions
        while (smsQueue.length > 0) {
          portions.push(smsQueue.splice(0, 100));
        }

        //send all the sms by the 100 rows
        async.eachSeries(portions, function (portion) {
          var portionPromises = [];
          portion.forEach(function (item) {
            portionPromises.push(
              Sms.send(item.phone, item.smsText)
                .then(function(response) {
                  if(response.RESULT !== "False") {
                    item.state = response.DESCRIPTION;
                    item.session = response.SESSION;
                    item.status = smsQueueReferences['sentToService'];
                    item.save();
                    return {
                      smsModel: item,
                      response: response
                    }
                  }
                })
            )
          });

          //handling all responses
          return Promise.each(portionPromises, function(promise) {
            if(promise) {
              return Event.where({_id: promise.smsModel.event}).findOneQ()
                .then(function(event) {
                  //change the status of event to the wave ended
                  event.eventStatus = (_.invert(eventReferences.eventStatuses))
                    [eventReferences.eventWavesTypes[promise.smsModel.waveType][eventReferences.waveStatus.end]];
                  return event.saveQ();
                })
            }
          })
          .catch(function(err) {
            File.writeToFile('/error.log', err.message);
          })
        });
      });
  };

  /**
   * Route for sms sending
   * @param req
   * @param res
   * @param next
   */
  var smsRoute = function (req, res, next) {
    sms()
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    sms : sms,
    smsRoute : smsRoute
  }

}();

if(env === 'development') {
  router.get('/cron/send/sms', send.smsRoute);
}

module.exports = {
  controller: function (app) {
    app.use('/', router);
  },
  send: send
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

