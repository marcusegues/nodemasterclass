// Dependencies
var http = require('http');
var url = require('url');
var config = require('./config');

// Instantiate HTTP server
const httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log('Listening on port ' + config.httpPort);
});

// Server logic
var unifiedServer = function(req, res) {
  // get data from request object
  var parsedUrl = url.parse(req.url, true);

  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  var method = req.method.toLowerCase();

  // handle the request with appropriate handler
  var chosenHandler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound;

  var data = { method };

  chosenHandler(data, function(statusCode, payload) {
    statusCode = typeof statusCode === 'number' ? statusCode : 200;
    payload = typeof payload === 'object' ? payload : {};

    var payloadString = JSON.stringify(payload);

    // return the response
    res.writeHead(statusCode);
    res.end(payloadString);
  });
};

var handlers = {};

handlers.hello = function(data, callback) {
  // only handle post on path /hello
  if (data.method === 'post') {
    callback(200, { message: 'Welcome to outer space...' });
  } else {
    callback(404);
  }
};

handlers.notFound = function(data, callback) {
  callback(404);
};

var router = {
  hello: handlers.hello,
};
