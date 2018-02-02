#!/usr/bin/env node

"use strict"

let avr = require("./avr.js");
let toctoc = require('../toctoc/toctoc.js');
let moment = require("moment");

let turnONRadio = () => {
	avr.on();

	// Position Tuner
	setTimeout(() => {
		avr.tuner();
		avr.setVolume(-30);
	}, 10 * 1000);
};

module.exports = {
	startTuner : (duration) => {
		startAVR(duration);
	},
	startTunerOnlyIfPresent : (duration) => {
		avr.getStatus((status) => {
			if(status.item.Power.value === 'ON') {
				console.log('AVR is already in use !');
			} else {
				let retry = 10 * 1000 /* ms */;
				let ellapsedTime = 0;
				let isPresent = false;
				for (let ellapsedTime = 0; ellapsedTime < duration * 60 * 1000 /* ms */; ellapsedTime += retry) {
					setTimeout(() => {
						toctoc.ifPresent(
							// Présent
							() => {
								if(!isPresent) {
									console.log('Turning AVR ON');
									turnONRadio();
									isPresent = true;
								}
							},
							// Absent
							() => {
								if(isPresent) {
									console.log('Turning AVR OFF');
									avr.off();
									isPresent = false;
								}
							}
						);
					}, ellapsedTime);
				}
				
				setTimeout(() => {
					avr.off();
				}, duration * 60 * 1000 /* ms */);	
			}
		});
	}
};

