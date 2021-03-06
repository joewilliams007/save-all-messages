var common = require('../../common');
var assert = require('assert');

var conn1Err  = null;
var conn2Err  = null;
var poolEnded = false;
var server    = common.createFakeServer();

server.listen(0, function (err) {
  assert.ifError(err);

  var pool = common.createPool({
    connectionLimit    : 1,
    port               : server.port(),
    queueLimit         : 5,
    waitForConnections : true
  });

  pool.getConnection(function(err, conn){
    if (err) throw err;

    pool.end(function(err) {
      poolEnded = true;
      server.destroy();
      if (err) throw err;
    });

    conn.release();
  });

  pool.getConnection(function (err) {
    conn1Err = err;
  });

  pool.getConnection(function (err) {
    conn2Err = err;
  });
});

process.on('exit', function() {
  assert.ok(poolEnded);
  assert.ok(conn1Err);
  assert.ok(conn2Err);
  assert.equal(conn1Err.message, 'Pool is closed.');
  assert.equal(conn2Err.code, 'POOL_CLOSED');
  assert.equal(conn1Err.message, 'Pool is closed.');
  assert.equal(conn2Err.code, 'POOL_CLOSED');
});
