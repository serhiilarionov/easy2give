'use strict';

var Template = function() {
  var File = require('./file.js');

  /**
   * Get template and prepare text for sending
   * @param filePath
   * @param paramList
   * @returns {Promise.<T>}
   */
  var getTemplate = function(filePath, paramList) {
    return File.readFromFile(filePath)
      .then(function(template) {
        for(var index in paramList) {
          var re = new RegExp("%"+index+"%","g");
          template = template.replace(re, paramList[index]);
        }
        return template;
      })
      .catch(function(err) {
        return err;
      })
  };

  return {
    getTemplate: getTemplate
  }
}();

module.exports = Template;