const config = require('../config');
const helpers = require('../helpers');
const _data = require('../data');

const checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
checks.post = (data, callback) => {
  // check required fields
  var protocol =
    typeof data.payload.protocol === 'string' && ['https', 'http'].indexOf(data.payload.protocol) !== -1
      ? data.payload.protocol.trim()
      : false;

  var url =
    typeof data.payload.url === 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;

  var method =
    typeof data.payload.method === 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) !== -1
      ? data.payload.method.trim()
      : false;

  var successCodes =
    typeof data.payload.successCodes === 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;

  var timeoutSeconds =
    typeof data.payload.timeoutSeconds === 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get the token from the headers
    var token = typeof data.headers.token === 'string' ? data.headers.token : false;

    // Get the token data
    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            const userChecks = userData.checks || [];
            // validate that the number of checks is less than max number allowed
            if (userChecks.length < config.maxChecks) {
              // save the check to disk and update the user's checks
              const id = helpers.createRandomString(20);
              const newCheck = {
                id,
                userPhone,
                protocol,
                url,
                method,
                successCodes,
                timeoutSeconds,
              };

              _data.create('checks', id, newCheck, err => {
                if (!err) {
                  userData.checks = userChecks;
                  userData.checks.push(newCheck);
                  _data.update('users', userPhone, userData, err => {
                    if (!err) {
                      callback(200);
                    } else {
                      callback(500, { error: 'Could not update the user with the new check' });
                    }
                  });
                } else {
                  callback(500, { error: 'Error creating the check.' });
                }
              });
            } else {
              callback(400, { error: `User already has max number of checks: ${config.maxChecks}` });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(401);
      }
    });

    // create a new check object with _data

    // update the checks key in the userData
  } else {
    callback(400, { error: 'Missing required inputs, or inputs invalid' });
  }
};

module.exports = checks;
