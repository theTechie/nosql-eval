var helper = require('./helper'),
    Q = require('q');

var DynamoDB = new helper.AWS.DynamoDB(),
    TABLE_NAME = 'CS550';

function init(callback) {
  return createTable(callback);
}

// NOTE: create table
function createTable(callback) {
    var deferred = Q.defer();

    var params = {
        AttributeDefinitions: [ /* required */
            {
                AttributeName: 'key',
                /* required */
                AttributeType: 'S' /* required */
            }
        ],
        KeySchema: [ /* required */
            {
                AttributeName: 'key',
                /* required */
                KeyType: 'HASH' /* required */
            }
        ],
        ProvisionedThroughput: { /* required */
            ReadCapacityUnits: 20,
            /* required */
            WriteCapacityUnits: 20 /* required */
        },
        TableName: TABLE_NAME,
        /* required */
    };

    DynamoDB.createTable(params, function (err, data) {
      if (err && err.code != 'ResourceInUseException') {
        deferred.reject("createTable() : " + err + err.stack);
      } else {
        deferred.resolve(true);
      }
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Add key-value to table (key : 'key')
function putValue(key, value, callback) {
    var deferred = Q.defer();

    var params = {
        Item: { /* required */
            'key': {
              "S" : key.toString()
            },
            'value': {
              "S" : value.toString()
            }
        },
        TableName: TABLE_NAME,
        /* required */
        Expected: {
            key: {
                Exists: false
            }
        }
    };
    
    DynamoDB.putItem(params, function (err, data) {
        if (err) {
          console.log("Put:", err);
          deferred.reject(false);
        } else
          deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Get value from table (key : 'key')
function getValue(key, callback) {
    var deferred = Q.defer();

    var params = {
        Key: { /* required */
            'key': {
              "S" : key.toString()
            }
        },
        TableName: TABLE_NAME,
        AttributesToGet: [
          'value'
        ],
    };

    DynamoDB.getItem(params, function (err, data) {
      if (err) {
        console.log("Get:", err);
        deferred.reject(false);
      } else
        deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

// NOTE: Get value from table (key : 'key')
function deleteKey(key, callback) {
    var deferred = Q.defer();

    var params = {
        Key: { /* required */
            'key': {
              "S" : key.toString()
            }
        },
        TableName: TABLE_NAME
    };

    DynamoDB.deleteItem(params, function (err, data) {
      if (err) {
        console.log("Delete:", err);
        deferred.reject(false);
      } else
        deferred.resolve(true);
    });

    return deferred.promise.nodeify(callback);
}

function getSize(callback) {
  var deferred = Q.defer();
  
  deferred.resolve("SIZE of MongoDB");
  
  return deferred.promise.nodeify(callback);
}

module.exports = {
  init: init,
  putValue: putValue,
  getValue: getValue,
  deleteKey: deleteKey,
  getSize: getSize
};