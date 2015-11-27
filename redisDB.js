var Q = require('q'),
    redis = require('redis'),
    url = 'redis://172.17.0.2:6379',
    TABLE_NAME = 'CS550',
    RedisClient;

function init(callback) {
  var deferred = Q.defer();
  
  RedisClient = redis.createClient(url);
  
  RedisClient.on('error', function (err) {
    console.log("Error : ", err);
    process.exit();
  });
  
  deferred.resolve(true);
  
  return deferred.promise.nodeify(callback);
}

function createTable(callback) {
  var deferred = Q.defer();
  
  deferred.resolve(true);
  
  return deferred.promise.nodeify(callback);
}

// NOTE: Add key-value to table (key : 'key' value: 'value')
function putValue(key, value, callback) {
    var deferred = Q.defer();

    RedisClient.set(key, value, function (err, result) {
      if (err) deferred.reject(false);
      else deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Get value from table (key : 'key')
function getValue(key, callback) {
    var deferred = Q.defer();

    RedisClient.get(key, function (err, result) {
      if (err) deferred.reject(false);
      else deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Get value from table (key : 'key')
function deleteKey(key, callback) {
    var deferred = Q.defer();

    RedisClient.del(key, function (err, result) {
      if (err) deferred.reject(false);
      else deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

function getSize(callback) {
  var deferred = Q.defer();
  
  RedisClient.keys('*', function (err, result) {
    if (err) deferred.reject(false);
    else deferred.resolve(result.length);
  });
  
  return deferred.promise.nodeify(callback);
}

function tearDown() {
  RedisClient.quit();
}

module.exports = {
  init: init,
  putValue: putValue,
  getValue: getValue,
  deleteKey: deleteKey,
  getSize: getSize,
  tearDown: tearDown
};