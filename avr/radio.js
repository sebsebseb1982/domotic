#!/usr/bin/env node

"use strict"

let avr = require("./avr.js");
let toctoc = require('../toctoc/toctoc.js');
let moment = require("moment");

let startAVR = (duration) => {
	avr.on();

	// Position Tuner
	setTimeout(() => {
		avr.tuner();
	}, 10 * 1000);

	let durationInMs = duration * 60 * 1000 /* ms */;
	let showEnd = moment().add(durationInMs, 'ms');
	
	setTimeout(() => {
		avr.off();
	}, showEnd.diff(moment()));	
};

module.exports = {
	startTuner : (duration) => {
		startAVR(duration);
	},
	startTunerOnlyIfPresent : (duration) => {
		avr.getStatus((status) => {
			let isAvrStarted = status.item.Power.value === 'ON';
			console.log('AVR already in use ?', isAvrStarted);

			let retry = 10 * 1000 /* ms */;
			let ellapsedTime = 0;
			
			for (let ellapsedTime = 0; ellapsedTime < duration * 60 * 1000 /* ms */; ellapsedTime += retry) {
				setTimeout(() => {
					toctoc.ifPresent(() => {
						if(!isAvrStarted) {
							startAVR(duration - ellapsedTime);
							avr.setVolume(-30);
							isAvrStarted = true;
						}
					});
				}, ellapsedTime);
			}	
		});
	}
};

