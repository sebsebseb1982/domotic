#!/usr/bin/env node

"use strict"

let _ = require('lodash');
let fs = require('fs');
let moment = require('moment');

module.exports = {
	photosSince: (camera, since) => {
		let photosSince = [];
		
		let snapshots = fs.readdirSync(camera.path);
		_.forEach(snapshots, (aSnapshot) => {
			let stats = fs.statSync(camera.path + '/' + aSnapshot);
			if(moment(stats['birthtime']).isAfter(since)) {
				photosSince.push(aSnapshot);
			}
		});
		
		return photosSince;
	}
}