var HashTable = require('hashtable'),
    Store = new HashTable(),
    Q = require('q');

function init(callback) {
  var deferred = Q.defer();
  
  Store = new HashTable();
  deferred.resolve(true);
  
  return deferred.promise.nodeify(callback);
}

function putValue(key, value, callback) {
    var deferred = Q.defer();
    
    var status = Store.put(key, value);
    
    if (status) {
      deferred.resolve(status);
    } else {
      deferred.reject("putValue : " + status);
    }
    
    return deferred.promise.nodeify(callback);
}

function getValue(key, callback) {
    var deferred = Q.defer();
    
    var value = Store.get(key);
    
    if (value) {
      deferred.resolve(value);
    } else {
      deferred.reject("getValue : " + value);
    }
    
    return deferred.promise.nodeify(callback);
}

function deleteKey(key, callback) {
    var deferred = Q.defer();
    
    var status = Store.remove(key);
    
    if (status) {
      deferred.resolve(status);
    } else {
      deferred.reject("deleteKey : " + status);
    }
    
    return deferred.promise.nodeify(callback);
}

function getSize(callback) {
  var deferred = Q.defer();
  
  deferred.resolve(Store.size());
  
  return deferred.promise.nodeify(callback);
}

module.exports = {
  init: init,
  putValue: putValue,
  getValue: getValue,
  deleteKey: deleteKey,
  getSize: getSize
};
