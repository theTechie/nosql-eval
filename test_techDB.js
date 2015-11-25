/**
 * Created by gags on 11/14/15.
 */
var inquirer = require('inquirer'),
    io = require('socket.io-client'),
    fs = require('fs'),
    path = require('path'),
    ip = require('ip'),
    Server = require('socket.io'),
    HashTable = require('hashtable'),
    ConsistentHashing = require('consistent-hashing'),
    constants = require('./constants'),
    ioServer = new Server();

var log = false;

var argv = require('optimist')
    .usage('Usage: $0 -c [CONFIG] -p [PORT] -k [KEY_RANGE]')
    .demand(['c', 'p', 'k'])
    .alias('c', 'config')
    .describe('c', 'Config file with list of ip and port pair identifying peers')
    .alias('p', 'port')
    .describe('p', 'Port to run peer on')
    .alias('k', 'keyRange')
    .describe('k', 'Key Range')
    .argv;

var peers = validateConfig(argv.config),
    peersList = new ConsistentHashing(peers);

// NOTE: Validate config file
if (!peers) {
    console.log("Please enter valid IP address and port separated by a space in config file ! : [IP_ADDRESS] [PORT] => ", argv.config);
    process.exit();
}

// NOTE: Setup Store
var Store = require('./techDB');

Store.init().then(function (status) {
  if (status)
    listOperations();
  else
    console.log("ERROR INITIALIZING DB !");
}, function (err) {
  console.log(err);
});

// NOTE: List the operations supported by DHT
function listOperations() {
    var requestForOperation = [{
        type: "list",
        name: "operation",
        message: "Please select the operation you would like to perform : ",
        choices: ['Perform Tests']
    }];

    inquirer.prompt(requestForOperation, function( response ) {
      // NOTE: Perform operations in sequence
      doTest(constants.TEST_PUT);
    });
}

var iteration = 0;
var totalLatency = 0;
var keyRange = argv.keyRange;
var maxIteration = 10;

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
    if (iteration < maxIteration) {
        delegateOperationToPeer(keyRange.toString(), constants.TEST_PUT, {
          key: keyRange.toString(),
          value: keyRange.toString() + '_value'
        });
        keyRange++; iteration++;
    } else {
        console.log("Total Put Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize(function (size) {
          console.log("Size : ", size);
        });

        iteration = 0;
        totalLatency = 0;
        keyRange = argv.keyRange;
        
        doTest(constants.TEST_GET);
    }
}

function testGet() {
    if (iteration < maxIteration) {
        delegateOperationToPeer(keyRange.toString(), constants.TEST_GET, {
          key: keyRange.toString(),
          value: keyRange.toString() + '_value'
        });
        keyRange++; iteration++;
    } else {
        console.log("Total Get Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize(function (size) {
          console.log("Size : ", size);
        });

        iteration = 0;
        totalLatency = 0;
        keyRange = argv.keyRange;
        
        doTest(constants.TEST_DELETE);
    }
}

function testDelete() {
    if (iteration < maxIteration) {
        delegateOperationToPeer(keyRange.toString(), constants.TEST_DELETE, {
          key: keyRange.toString(),
          value: keyRange.toString() + '_value'
        });
        keyRange++; iteration++;
    } else {
        console.log("Total Delete Latency / Lookup (ms) : ", totalLatency / maxIteration);
        Store.getSize(function (size) {
          console.log("Size : ", size);
        });

        iteration = 0;
        totalLatency = 0;
        keyRange = argv.keyRange;
    }
}

// NOTE: perform specific operation based on 'operation' using the 'key' and 'value'
function performOperation(operation, key, value, callback) {
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

// NOTE: Find target peer using ConsistentHashing
function findTargetPeer(key) {
    return peersList.getNode(key);
}

var sockets = new HashTable();

function delegateOperationToPeer(key, operation, operation_params) {
    var socket_address;
    var peerID = findTargetPeer(key);

    if (validateAddress(peerID)) {
        socket_address = "http://" + peerID.split(" ").join(":");
    } else {
        logClientMessage("ERROR : SOMETHING TERRIBLY WENT WRONG WHILE CONNECTING TO PEER !");
        process.exit();
    }

    var socket;

    if (sockets.has(peerID)) {
        socket = sockets.get(peerID);

        socket.emit('operation', {
          operation: operation,
          params: operation_params,
          timestamp: Date.now()
        });
    } else {
        socket = io(socket_address);

        console.log("Connecting to peer : ", socket_address);

        socket.on('op_status', function (response) {
            logClientMessage(response.operation + " : Status => " + response.status);

            var latency = Date.now() - response.timestamp;
            totalLatency += latency;

            doTest(response.operation);
        });

        socket.on('connect', function () {
            logClientMessage("Connected to Peer Server !");

            socket.emit('operation', {
              operation: operation,
              params: operation_params,
              timestamp: Date.now()
            });
        });

        sockets.put(peerID, socket);
    }
}

// NOTE: DHT Peer Server
ioServer.on('connect', function (socket) {
    logServerMessage("Connected with Peer Client : " + socket.handshake.address);

    console.log("Open Client Connections : ", socket.server.engine.clientsCount);

    socket.on('operation', function (response) {
        performOperation(response.operation, response.params.key, response.params.value,
          function (status) {
            // NOTE : Get STATUS in callback
            socket.emit('op_status', {
              operation: response.operation,
              status:  status,
              timestamp: response.timestamp
            });
        });
    });
});

// NOTE: validate the config file for correct peer addresses
function validateConfig(fileName) {
    var peers = fs.readFileSync(fileName).toString().split('\n');

    var invalidPeers = peers.filter(function (peer, i) {
        return !validateAddress(peer);
    });

    return invalidPeers.length > 0 ? false : peers;
}

// NOTE: check if address is valid (ip:port)
function validateAddress(entry) {
    var ip_port = entry.split(" ");
    var blocks = ip_port[0].split(".");

    if (ip_port.length < 2)
        return false;

    if(blocks.length === 4) {
        return blocks.every(function(block) {
            return parseInt(block,10) >=0 && parseInt(block,10) <= 255;
        });
    }
    return false;
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

ioServer.listen(argv.port);
console.log("\n Server running at : " + ip.address() + ":" + argv.port);
