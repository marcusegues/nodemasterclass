/*
 * Helpers for various tasks
 */

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof str === 'string' && str.length > 0) {
    return crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function(str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength) {
  strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // Start the string
    var str = '';
    for (i = 1; i <= strLength; i++) {
      // Get a random character from possible characters string
      var rand = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append character to final string
      str += rand;
    }

    // return final string
    return str;
  } else {
    return false;
  }
};

module.exports = helpers;
