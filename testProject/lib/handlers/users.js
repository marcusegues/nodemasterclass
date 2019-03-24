const _data = require('../data');
const tokens = require('./tokens');
const helpers = require('../helpers');

const users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
users.post = function(data, callback) {
  // check that all required fields are filled out
  var firstName =
    typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement = !!(typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement);
  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read('users', phone, function(err, data) {
      if (err) {
        // hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // create user object
          var userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true,
          };

          // store the user
          _data.create('users', phone, userObject, function(err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { error: "Could not hash the user's password" });
        }
      } else {
        callback(400, 'A user with that phone number already exists');
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/*
 * Required data: phone
 * Optional data: none
 */
users.get = function(data, callback) {
  // check all required fields: phone
  var phone =
    typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    // get the token from the headers
    var token = typeof data.headers.token === 'string' ? data.headers.token : false;

    // verify that the given token is valid for the phone number
    tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // read the data from the file
        _data.read('users', phone, function(err, data) {
          if (!err && data) {
            // remove hashed password from user object
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(500, { error: 'Could not read user data' });
          }
        });
      } else {
        callback(403, { error: 'Missing required token or token is invalid' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/*
 * Users - put
 * Required data: phone
 * Optional data: firstName, lastName, password (at least on must be specified)
 */
users.put = function(data, callback) {
  // check required fields
  var phone =
    typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  // check optional fields
  var firstName =
    typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  var password =
    typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      var token = typeof data.headers.token === 'string' ? data.headers.token : false;

      tokens.verifyToken(token, phone, tokenIsValid => {
        if (tokenIsValid) {
          _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
              // update the fields that are necessary
              userData = {
                ...userData,
                firstName: firstName || userData[firstName],
                lastName: lastName || userData[lastName],
                password: password || userData[password],
              };
              _data.update('users', phone, userData, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { error: 'Could not update the user' });
                }
              });
            } else {
              callback(400, { error: 'The specified user does not exist' });
            }
          });
        } else {
          callback(403, { error: 'Missing required token or token is invalid' });
        }
      });
    } else {
      callback(404, 'Missing required fields');
    }
  } else {
    callback(404, 'Missing required fields');
  }
};

/*
Required field: phone
 */
users.delete = function(data, callback) {
  // check all required fields: phone
  var phone =
    typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    // check the token
    var token = typeof data.headers.token === 'string' ? data.headers.token : false;
    tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // read the data from the file
        _data.read('users', phone, function(err, data) {
          if (!err && data) {
            // remove hashed password from user object
            _data.delete('users', phone, function(err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, { error: 'Could not delete user' });
              }
            });
          } else {
            callback(400, { error: 'Could not find specified user' });
          }
        });
      } else {
        callback(403, { error: 'Missing required token, or token is invalid' });
      }
    });
  } else {
    callback(400, { error: 'Missing required field: phone' });
  }
};

module.exports = users;
