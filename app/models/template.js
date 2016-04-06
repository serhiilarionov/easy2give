'use strict';

var Template = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    mongoose = require('mongoose-promised'),
    Schema = mongoose.Schema;

  //scheme of Template model
  var TemplateScheme = new Schema({
    name : {type: String, required: true, index: { unique: true }},
    title : {type: String},
    type : {type: String},
    audience : {type: String},
    text : {type: String},
    createdAt: {type: Date},
    updatedAt: {type: Date}
  });

  TemplateScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format(dateFormats.format);

    // change the updatedAt field to current date
    this.updatedAt = currentDate;

    // if createdAt doesn't exist, add to that field
    if (!this.createdAt)
      this.createdAt = currentDate;

    next();
  });

  /**
   * Get content for sms by contentType
   * @param contentType
   * @param paramsList
   * @returns {Promise.<T>}
   */
  TemplateScheme.methods.getContent = function getContent(contentType, paramsList) {
    return this.model('Template').where({name: contentType})
      .findOneQ()
      .then(function (template){
        for(var index in paramsList) {
          var re = new RegExp("%"+index+"%","g");
          template.text = template.text.replace(re, paramsList[index]);
        }
        return template.text;
      });
  };

  //the model uses the schema declaration
  var _model = mongoose.model('Template', TemplateScheme, 'Template');

  return {
    schema : TemplateScheme,
    model : _model
  }
}();
module.exports = Template;