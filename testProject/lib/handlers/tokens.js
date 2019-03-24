const _data = require('../data');
const helpers = require('../helpers');

const tokens = {};

// Tokens
// Required data: phone, password
// Optional data: none
tokens.post = function(data, callback) {
  // check required fields
  var phone =
    typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  var password =
    typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone && password) {
    // Lookup the user who matches that phone number
    _data.read('users', phone, function(err, userData) {
      if (!err && userData) {
        var hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // if valid, create a new token with a random name. Set expiration date one hour ahead
          var tokenId = helpers.createRandomString(20);

          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone,
            id: tokenId,
            expires,
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, function(err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { error: 'Could not create new token' });
            }
          });
        } else {
          callback(400, { error: 'Password did not match the stored user password.' });
        }
      } else {
        callback(400, { error: 'Could not find specified user' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Tokens - get
// Required data: id
// Optional data: none
tokens.get = function(data, callback) {
  // check that the id is valid
  var id =
    typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id
      : false;

  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
tokens.put = function(data, callback) {
  // check required fields
  var id =
    typeof data.payload.id === 'string' && data.payload.id.trim().length === 20
      ? data.payload.id.trim()
      : false;

  // check required fields
  var extend = typeof data.payload.extend === 'boolean' && data.payload.extend === true ? true : false;

  if (id && extend) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // check that token isn't already expired
        if (tokenData.expires > Date.now()) {
          // set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // store new updates
          _data.update('tokens', id, tokenData, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: 'Could not update token expiration' });
            }
          });
        } else {
          callback(400, { error: 'Token has expired and cannot be extended.' });
        }
      } else {
        callback(400, { error: 'Specified token does not exist' });
      }
    });
  } else {
    callback(400, { error: 'Missing required field(s) or field(s) are invalid' });
  }
};

// Tokens - delete
// Required data: id
// Optional data: none
tokens.delete = function(data, callback) {
  // check required fields
  var id =
    typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;

  if (id) {
    // read the data from the file
    _data.read('tokens', id, function(err, data) {
      if (!err && data) {
        // remove hashed password from user object
        _data.delete('tokens', id, function(err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'Could not delete token' });
          }
        });
      } else {
        callback(400, { error: 'Could not find specified token' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Verify if a given token id is currently valid for a given user
tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = tokens;
