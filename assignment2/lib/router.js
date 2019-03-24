var handlers = require('./handlers');

var router = {
  ping: handlers.ping,
  users: handlers.users,
};

module.exports = router;
