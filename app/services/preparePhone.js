'use strict';

/**
 * Prepare phone number to standart
 * @return bool|mixed
 * @param phone
 */
var preparePhone = function(phone) {
  if (!phone) return false;
  //remove symbols
  phone = phone.replace(/\D/g, '');

  //check if 0 not exists for 9 symbols numbers
  if (phone.match(/^.{9,9}$/i)) {
    phone = '0' + phone;
  }

  //replace first 0 or 972 to +972
  phone = phone.replace(/^0|^972/i, '+972');

  //allow only 13 character number which must start from +972
  if (phone.match(/^\+972[0-9]{9,9}$/i)) {
    return phone;
  } else {
    return false;
  }
};

module.exports = preparePhone;