'use strict';

var Template = function(){
  var moment = require('moment'),
    dateFormats = require('../../config/dateFormats.js'),
    mongoose = require('mongoose-promised'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

  //scheme of Template model
  var TemplateScheme = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    name : {type: String, required: true, index: { unique: true }},
    title : {type: String},
    type : {type: String},
    audience : {type: String},
    text : {type: String},
    _created_at: {type: Date},
    _updated_at: {type: Date}
  });

  TemplateScheme.pre('save', function(next) {
    // get the current date
    var currentDate = moment().format(dateFormats.format);

    // change the _updated_at field to current date
    this._updated_at = currentDate;

    // if _created_at doesn't exist, add to that field
    if (!this._created_at)
      this._created_at = currentDate;

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

  _model.update({name: 'instruction'}, {
    text: 'פתחנו עבורכם חשבון חדש במערכת וידואי הגעה מבית Easy2Give:\n\nלהלן לינק ליצירת רשימת המוזמנים:\n %bitlyGuestTable%\nשם המשתמש שלכם: %coupleId%\nסיסמה: %password%\n\nלינק לאפליקציית אייפון:\n %bitlyAppStore%\nלינק לאפליקציית אנדרואיד:\n %bitlyGooglePlay%\n\nנתראהבשמחות, צוות; Easy2Give'
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'firstWave'}, {
    text: "שימו לב, גל הסמסים השני יוצא לדרך."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'secondWave'}, {
    text: "שימו לב, גל הסמסים השני יוצא לדרך."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'coupleRemindCallCenterStart'}, {
    text : "היי, שימו לב! וידוא הגעה טלפוני לאירוע יצא לדרך ב- %callCenter%. אנא ודאו שבחרתם %callTeamLimit% אורחים מטבלת המוזמנים על ידי סימון השורות הרלוונטיות. ללא בחירתכם, לא נוכל לבצע את השירות."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'coupleBeforeStartingFirstWave'}, {
    text : "שימו לב, גל סמסים ראשון מתחיל בעוד 24 שעות."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'coupleBeforeStartingSecondWave'}, {
    text : "שימו לב, גל סמסים שני מתחיל בעוד 24 שעות."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'coupleBeforeStartingCallCenter'}, {
    text : "שימו לב, מערכת וידוא הגעה טלפוני מתחילה בעוד 24 שעות."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'coupleAlertText'}, {
    text : "טרם בחרתם את זמני שליחת הSMS לטובת אישורי ההגעה. לדיוק מירבי בתוצאות מומלץ לשלוח את הגל הראשון עשרה ימים לפני מועד האירוע ואת הגל השני 8-9 ימים לפני מועד האירוע."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });
  _model.update({name: 'coupleCallCenterStarted'}, {
    text : "שימו לב, טבלת המוזמנים עוברת לטלפניות לוידוא הגעה טלפוני."
  }, {upsert: true}, function (err) {
    if(err) {
      console.log(err);
    }
  });

  return {
    schema : TemplateScheme,
    model : _model
  }
}();
module.exports = Template;