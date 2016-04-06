'use strict';

var Template = function() {
  var File = require('./file.js'),
    mongoose = require('mongoose-promised'),
    ErrorLog = mongoose.model('Error');

  /**
   * Get template and prepare text for sending
   * @param filePath
   * @param paramsList
   * @returns {Promise.<T>}
   */
  var getTemplate = function(filePath, paramsList) {
    return File.readFromFile(filePath)
      .then(function(template) {
        for(var index in paramsList) {
          var re = new RegExp("%"+index+"%","g");
          template = template.replace(re, paramsList[index]);
        }
        return template;
      })
      .catch(function(err) {
        new ErrorLog({
          errorStatus: err.status || 500,
          errorMessage: err.message,
          error: err
        }).save();
        File.writeToFile('/error.log', err.message);
        return err;
      })
  };

  return {
    getTemplate: getTemplate
  }
}();

module.exports = Template;