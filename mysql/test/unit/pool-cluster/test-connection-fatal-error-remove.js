var assert  = require('assert');
var common  = require('../../common');
var cluster = common.createPoolCluster({removeNodeErrorCount: 1});

var server = common.createFakeServer();

server.listen(0, function (err) {
  assert.ifError(err);

  cluster.add('MASTER', common.getTestConfig({
    acquireTimeout : 100,
    port           : server.port()
  }));

  var pool = cluster.of('*', 'RR');

  pool.getConnection(function (err) {
    assert.ok(err, 'got error');
    assert.equal(err.code, 'PROTOCOL_SEQUENCE_TIMEOUT');
    assert.equal(err.fatal, true);

    cluster.end(function (err) {
      assert.ifError(err);
      server.destroy();
    });
  });
});

server.on('connection', function () {
  // Let connection time out
});
