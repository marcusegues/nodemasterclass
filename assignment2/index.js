// Dependencies
var config = require('./lib/config');

var server = require('./lib/server');

// parse the request

// form a data object, determine the correct handler for the request, and call the handler passing in the data

// write the data file separately: operations on the resources
// users - create, edit, delete
// fields - name, email, address, street address

// Listen on port
server.listen(config.httpPort, function() {
  console.log('The server is listening on port ' + config.httpPort);
});
