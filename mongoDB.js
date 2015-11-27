var Q = require('q'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    url = 'mongodb://172.17.0.2:27017/nosql-eval',
    TABLE_NAME = 'CS550',
    db_obj;

function init(callback) {
  var deferred = Q.defer();
  
  MongoClient.connect(url, function(err, db) {
    if (err) deferred.reject(false);
    else {
      db_obj = db;
      createTable().then(function (result) {
        if (result)
          deferred.resolve(true);
        else
          deferred.reject(false);
      });
    }
  });
  
  return deferred.promise.nodeify(callback);
}

function createTable(callback) {
  var deferred = Q.defer();
  
  db_obj.createCollection(TABLE_NAME, function (err, result) {
    if (err) deferred.reject(false);
    else deferred.resolve(true);
  });
  
  return deferred.promise.nodeify(callback);
}

// NOTE: Add key-value to table (key : 'key' value: 'value')
function putValue(key, value, callback) {
    var deferred = Q.defer();

    db_obj.collection(TABLE_NAME).insertOne({
      key: key,
      value: value
    }, function (err, result) {
      if (err) deferred.reject(false);
      else deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Get value from table (key : 'key')
function getValue(key, callback) {
    var deferred = Q.defer();

    db_obj.collection(TABLE_NAME).find({
      key: key
    }, function (err, result) {
      if (err) deferred.reject(false);
      else deferred.resolve(result);
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Get value from table (key : 'key')
function deleteKey(key, callback) {
    var deferred = Q.defer();

    db_obj.collection(TABLE_NAME).deleteOne({
      key: key
    }, function (err, result) {
      if (err) deferred.reject(false);
      else deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

function getSize(callback) {
  var deferred = Q.defer();
  
  db_obj.collection(TABLE_NAME).find().count(function (err, count) {
      if (err) deferred.reject(false);
      else deferred.resolve(count);
  });
  
  return deferred.promise.nodeify(callback);
}

function teadDown() {
  db_obj.close();
}

module.exports = {
  init: init,
  putValue: putValue,
  getValue: getValue,
  deleteKey: deleteKey,
  getSize: getSize,
  teadDown: teadDown
};