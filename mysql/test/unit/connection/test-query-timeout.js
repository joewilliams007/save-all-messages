var assert = require('assert');
var common = require('../../common');

var server = common.createFakeServer();
var timer  = setTimeout(function () {
  throw new Error('test timeout');
}, 2000);

server.listen(0, function (err) {
  assert.ifError(err);

  var connection = common.createConnection({port: server.port()});

  connection.query({sql: 'SELECT 1', timeout: 200}, function (err) {
    assert.ok(err);
    assert.equal(err.code, 'PROTOCOL_SEQUENCE_TIMEOUT');
    assert.equal(err.fatal, true);
    assert.equal(err.message, 'Query inactivity timeout');
    assert.equal(err.timeout, 200);
  });
});

server.on('connection', function(conn) {
  conn.handshake();
  conn._socket.on('close', function() {
    clearTimeout(timer);
    server.destroy();
  });
  conn.on('query', function () {
    // Do nothing; timeout
  });
});
