/**
 * Created by gags on 11/14/15.
 */
var constants = require('./constants'),
    Store = require('./mongoDB'),
    KeyProvider = require('./keyProvider');

var logEnabled = false;

var argv = require('optimist')
    .usage('Usage: $0 -k [KEY_RANGE]')
    .demand(['k', 'i'])
    .alias('k', 'keyRange')
    .describe('k', 'Key Range')
    .alias('i', 'iterations')
    .describe('i', 'Iterations')
    .argv;

var iteration = 0,
    maxIteration = argv.iterations;

var totalLatency = 0,
    latency = 0,
    startTime = Date.now();

// NOTE: Prepare Keys
KeyProvider.init(argv.keyRange, argv.iterations);

// NOTE: Initialize Test
Store.init().then(function (status) {
  if (status) {
    doTest(constants.TEST_PUT);
  } else {
    console.log("ERROR INITIALIZING DB !");
  }
}, function (err) {
  console.log(err);
  process.exit();
});

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
            logMessage("ERROR PERFORMING TEST: SOMETHING WENT TERRIBLY WRONG !");
    }
}

function testPut(value) {
    if (value) {
      latency = Date.now() - startTime;
      
      logMessage(latency);
      totalLatency += latency;
    } else
      startTime = Date.now();
  
    if (iteration < maxIteration) {
        performOperation(constants.TEST_PUT, KeyProvider.getKey(iteration), KeyProvider.getValue(iteration), testPut);
        iteration++;
    } else {
        console.log("Total Put Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize().then(function (size) {
          console.log("Size after Put : ", size);
          
          iteration = 0;
          totalLatency = 0;
          latency = 0;
          
          doTest(constants.TEST_GET);
        });
    }
}

function testGet(value) {
    if (value) {
      latency = Date.now() - startTime;
      
      logMessage(latency);
      totalLatency += latency;
    } else
      startTime = Date.now();
  
    if (iteration < maxIteration) {
        performOperation(constants.TEST_GET, KeyProvider.getKey(iteration), KeyProvider.getValue(iteration), testGet);
        iteration++;
    } else {
        console.log("Total Get Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize().then(function (size) {
          console.log("Size after Get : ", size);
          
          iteration = 0;
          totalLatency = 0;
          latency = 0;
          
          doTest(constants.TEST_DELETE);
        });
    }
}

function testDelete(value) {
    if (value) {
      latency = Date.now() - startTime;
      
      logMessage(latency);
      totalLatency += latency;
    } else
      startTime = Date.now();
    
    if (iteration < maxIteration) {
        performOperation(constants.TEST_DELETE, KeyProvider.getKey(iteration), KeyProvider.getValue(iteration), testDelete);
        iteration++;
    } else {
        console.log("Total Delete Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize().then(function (size) {
          console.log("Size after Delete: ", size);
          
          // NOTE: teardown
          Store.tearDown();
          process.exit();
        });

        iteration = 0;
        totalLatency = 0;
        latency = 0;
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
            logMessage("ERROR: SOMETHING WENT TERRIBLY WRONG !");
    }
}

// NOTE: log client message
function logMessage(message) {
    if (logEnabled)
        console.log("[Client] : ", message);
}
