'use strict';

/**
 * Clear old data from select db
 * @param date
 * @param modelName
 */
var clear = function(modelName, date) {
  var mongoose = require('mongoose-promised'),
    model = mongoose.model(modelName),
    File = require('./file.js'),
    Promise = require('bluebird'),
    async = require('async');
  if(model !== 'Error') {
    var ErrorLog = mongoose.model('Error');
  }
  //get data for clearing
  return model.where({createdAt: {"$lt": date}})
    .findQ()
    .then(function (items){
      var portions = [];
      //array divided into portions
      while (items.length > 0) {
        portions.push(items.splice(0, 1000));
      }

      //remove all the old data by the 1000 rows
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
            return cb();
          })
          .catch(function (err) {
            return cb(err);
          });
      }, function (err) {
        if (err) {
          new ErrorLog({
            errorStatus: err.status || 500,
            errorMessage: err.message,
            error: err
          }).save();
          File.writeToFile('/error.log', err.message);
        }
      });
    })
    .catch(function (err) {
      new ErrorLog({
        errorStatus: err.status || 500,
        errorMessage: err.message,
        error: err
      }).save();
      File.writeToFile('/error.log', err.message);
      return err;
    });
};

module.exports = clear;