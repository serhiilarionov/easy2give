'use strict';

var Template = function(){
  var moment = require('moment'),
    mongoose = require('mongoose-promised'),
    Schema = mongoose.Schema;

  //scheme of Event model
  var TemplateScheme = new Schema({
    name : {type: String, required: true, index: { unique: true }},
    title : {type: String},
    type : {type: String},
    audience : {type: String},
    text : {type: String},
    created_at: {type: Date},
    updated_at: {type: Date}
  });

  TemplateScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
      this.created_at = currentDate;

    next();
  });

  //the model uses the schema declaration
  var _model = mongoose.model('Template', TemplateScheme, 'Template');
  //var Test = new _model({
  //  name:'instruction',
  //  text: 'פתחנו עבורכם חשבון חדש במערכת וידואי הגעה מבית Easy2Give:\n\nלהלן לינק ליצירת רשימת המוזמנים:\n %bitlyGuestTable%\nשם המשתמש שלכם: %coupleId%\nסיסמה: %password%\n\nלינק לאפליקציית אייפון:\n %bitlyAppStore%\nלינק לאפליקציית אנדרואיד:\n %bitlyGooglePlay%\n\nנתראהבשמחות, צוות; Easy2Give'
  //});
  //Test.save();


  return {
    schema : TemplateScheme,
    model : _model
  }
}();
module.exports = Template;