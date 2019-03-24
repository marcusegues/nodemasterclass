// Dependencies
const http = require('http');
const url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var _data = require('./lib/data');
var handlers = require('./lib/handlers/index');
var helpers = require('./lib/helpers');

// Testing
// _data.read('test', 'newFiletest', function(err, data) {
//   console.log('error is', err);
//   console.log('this is data', data);
// });

// _data.update('test', 'newFiletest', { fizz: 'buzz' }, function(err, data) {
//   console.log('error is', err);
// });

// _data.delete('test', 'newFiletest', function(err, data) {
//   console.log('error is', err);
// });
// Respond to all requests with a string
var server = http.createServer(function(req, res) {
  console.log('Request url is ' + req.url);

  // Get the url and parse it
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    // given the path in the url, choose which handler should handle this request
    var chosenHandler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    // construct data object to send to the handler
    var data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // route the request to the handler
    chosenHandler(data, function(statusCode, payload) {
      // use  status code called back by handler or use default status code 200
      statusCode = typeof statusCode == 'number' ? statusCode : 200;
      // use payload called back by handler or use default: empty object
      payload = typeof payload == 'object' ? payload : {};

      // convert payload to string, to be sent back to user
      var payloadString = JSON.stringify(payload);

      // Send the response
      // writeHead writes status code to the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response ', statusCode, payloadString);
    });
  });
});

// Start server, listen on port 3000
server.listen(3000, function() {
  console.log('The server is listening on port ' + config.httpPort);
});

// Define request router
var router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};
