'use strict';

/**
 * Send email
 * @param date
 * @param modelName
 */
var clear = function(modelName, date) {
  var mongoose = require('mongoose-promised'),
    model = mongoose.model(modelName),
    File = require('./file.js'),
    Promise = require('bluebird'),
    async = require('async');

  //get data for clearing
  return model.where({created_at: {"$lt": date}})
    .findQ()
    .then(function (items){
      var portions = [];
      //array divided into portions
      while (items.length > 0) {
        portions.push(items.splice(0, 1000));
      }

      //remove all the old data asynchronosly by the 100 rows
      async.eachSeries(portions, function (portion, cb) {
        var portionPromises = [];
        portion.forEach(function (item) {
          portionPromises.push(
            model.where({
              _id: item._id
            }).removeQ()
          )
        });

        //handling all responses from all removals
        Promise.all(portionPromises)
          .then(function (res) {
            return cb(new Error('error'));
          })
          .catch(function (err) {
            return cb(err);
          });
      }, function (err) {
        if (err) {
          File.writeToFile('/error.log', err.message);
        }
      });

    })
    .catch(function (err) {
      return err;
    });
};

module.exports = clear;