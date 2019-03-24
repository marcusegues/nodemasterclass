// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');
const router = require('./router');

var server = http.createServer(function(req, res) {
  console.log(`Request url is ${req.url}`);

  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    // given the path in the url, choose which handler should handle this request
    const chosenHandler =
      typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // construct data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // route the request to the handler
    chosenHandler(data, function(statusCode, payload) {
      // use  status code called back by handler or use default status code 200
      statusCode = typeof statusCode === 'number' ? statusCode : 200;

      // use payload called back by handler or use default: empty object
      payload = typeof payload === 'object' ? payload : {};

      // convert payload to string, to be sent back to user
      const payloadString = JSON.stringify(payload);

      // Send the response
      // writeHead writes status code to the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(
        `Returning response with status code ${statusCode} and payload ${payloadString} `,
        statusCode,
        payloadString
      );
    });
  });
});

module.exports = server;
