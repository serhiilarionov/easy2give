'use strict';

var File = function() {

  var fs = require('fs'),
    Promise = require('bluebird');

  /**
   * Write to file
   * @param fileName
   * @param message
   * @returns {bluebird|exports|module.exports}
   */
  var writeToFile = function(fileName, message) {
    return new Promise(function(resolve, reject) {
      var path = './temp';
      if (!fs.existsSync(path)) {
        // Create the directory if it does not exist
        fs.mkdirSync(path);
      }
      fs.appendFile(path + fileName, message + '\n', function(err) {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      });
    });
  };

  /**
   * Read from file
   * @param filePath
   * @returns {bluebird|exports|module.exports}
   */
  var readFromFile = function(filePath) {
    return new Promise(function(resolve, reject) {
      fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    })
  };

  return {
    writeToFile: writeToFile,
    readFromFile: readFromFile
  }
}();

module.exports = File;