var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

AWS.config.region = 'us-west-2';

exports.AWS = AWS;
