/**
 * Created by gags on 11/14/15.
 */
var constants = require('./constants');

var log = false;

var argv = require('optimist')
    .usage('Usage: $0 -k [KEY_RANGE]')
    .demand(['k'])
    .alias('k', 'keyRange')
    .describe('k', 'Key Range')
    .argv;

// NOTE: Setup Store
var Store = require('./dynamoDB');

Store.init().then(function (status) {
  if (status) {
    doTest(constants.TEST_PUT);
    doTest(constants.TEST_GET);
    doTest(constants.TEST_DELETE);
  } else {
    console.log("ERROR INITIALIZING DB !");
  }
}, function (err) {
  console.log(err);
});

var iteration = 0;
var totalLatency = 0;
var keyRange = argv.keyRange;
var maxIteration = 10;
var startTime = Date.now();
var latency = 0;

function doTest(operation) {
    switch (operation) {
        case constants.TEST_PUT:
            testPut();
            break;
        case constants.TEST_GET:
            testGet();
            break;
        case constants.TEST_DELETE:
            testDelete();
            break;
        default:
            logServerMessage("ERROR PERFORMING TEST: SOMETHING WENT TERRIBLY WRONG !");
    }
}

function testPut() {
    latency = Date.now() - startTime;
    totalLatency += latency;
    
    if (iteration < maxIteration) {
        performOperation(constants.TEST_PUT, keyRange.toString(), keyRange.toString() + '_value', testPut);
        keyRange++; iteration++;
    } else {
        console.log("Total Put Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize().then(function (size) {
          console.log("Size : ", size);
        });

        iteration = 0;
        totalLatency = 0;
        keyRange = argv.keyRange;
        
        doTest(constants.TEST_GET);
    }
}

function testGet() {
    latency = Date.now() - startTime;
    totalLatency += latency;
  
    if (iteration < maxIteration) {
        performOperation(constants.TEST_GET, keyRange.toString(), keyRange.toString() + '_value', testGet);
        keyRange++; iteration++;
    } else {
        console.log("Total Get Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize().then(function (size) {
          console.log("Size : ", size);
        });

        iteration = 0;
        totalLatency = 0;
        keyRange = argv.keyRange;
        
        doTest(constants.TEST_DELETE);
    }
}

function testDelete() {
    latency = Date.now() - startTime;
    totalLatency += latency;
    
    if (iteration < maxIteration) {
        performOperation(constants.TEST_DELETE, keyRange.toString(), keyRange.toString() + '_value', testDelete);
        keyRange++; iteration++;
    } else {
        console.log("Total Delete Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize().then(function (size) {
          console.log("Size : ", size);
        });

        iteration = 0;
        totalLatency = 0;
        keyRange = argv.keyRange;
    }
}

// NOTE: perform specific operation based on 'operation' using the 'key' and 'value'
function performOperation(operation, key, value, callback) {
    startTime = Date.now();
    
    switch (operation) {
        case constants.TEST_PUT:
            Store.putValue(key, value).then(callback);
            break;
        case constants.TEST_GET:
            Store.getValue(key).then(callback);
            break;
        case constants.TEST_DELETE:
            Store.deleteKey(key).then(callback);
            break;
        default:
            callback(null);
            logServerMessage("ERROR: SOMETHING WENT TERRIBLY WRONG !");
    }
}

// NOTE: log client message
function logClientMessage(message) {
    if (log)
        console.log("[Client] : ", message);
}

// NOTE: log server message
function logServerMessage(message) {
    if (log)
        console.log("[Server] : ", message);
}
