#!/usr/bin/env node

let toctoc = require('../toctoc/toctoc.js');
let sun = require('../meteo/sun.js');
let rfx = require('../RFXtrx433/client.js');
let outlets = require('../RFXtrx433/power-outlets.js');
let _ = require('lodash');
let moment = require("moment");

let refreshRate = 60 * 1000;

let occurencesPerDay = Math.floor((24 * 60 * 60 * 1000) / refreshRate);

let lastTVSimulatorState;

let setTVSimulatorState = (state) => {
	console.log('tvSimulator State:', state);
	if(state !== lastTVSimulatorState) {
		rfx.switchPowerOutlet(outlets.tvSimulator, state);
		lastTVSimulatorState = state;
	}
};

setTVSimulatorState(false);

sun.execute((sunInfos) => {
	let currentTime = 0;
	
	for (i = 0; i < occurencesPerDay; i++) {
		setTimeout(() => {
			if(moment().isBetween(sunInfos.sunset, sunInfos.sunrise.add(1, 'days'))) {
				console.log("Il fait nuit");
				toctoc.ifAbsent(
					// Si personne dans la maison
					() => {
						setTVSimulatorState(true);
					},
					// Si nous sommes à la maison
					() => {
						setTVSimulatorState(false);
					}
				);
			} else {
				console.log("Il ne fait pas encore nuit");
				setTVSimulatorState(false);
			}
		}, currentTime);

		currentTime += refreshRate;
	}
});
