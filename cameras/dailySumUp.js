#!/usr/bin/env node

"use strict"

let _ = require('lodash');
let fs = require('fs');
let moment = require('moment');
let notifyMyAndroid = require('../nma/nma.js');
let cameras = require('./cameras.js');
let status = require('./status.js');

let yesterday = moment().subtract(1, 'days');

_.forEach(cameras, (aCamera) => {
	let photos = status.photosSince(aCamera, yesterday);
	aCamera.snapshotsCount = photos.length;
});

let preparerNotification = () => {
	
	let description = '';
	
	_.forEach(cameras, (aCamera) => {
		description += aCamera.label + ' (' + parseInt(aCamera.snapshotsCount ? aCamera.snapshotsCount : 0) + ' photo(s))\n';
	});
	
	return {
		'application' : 'CCTV',
		'event' : 'Resume quotidien',
		'description' : description,
		'priority' : 1
	};
};

notifyMyAndroid.send(preparerNotification());

