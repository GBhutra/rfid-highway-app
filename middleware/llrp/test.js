'use strict';

var llrp = require('./index.js');

var reader = new llrp({
	ipaddress: 'SpeedwayR-11-4A-D6.local'
});

reader.connect();

reader.on('timeout', function () {
	console.log('timeout');
});

reader.on('disconnect', function () {
	console.log('disconnect');
});

reader.on('error', function (error) {
	console.log('error: ' + JSON.stringify(error));
});

reader.on('didSeeTag', function (tag) {
	console.log('TAG: ' + tag.tagID);
});