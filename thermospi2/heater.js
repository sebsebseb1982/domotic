#!/usr/bin/env node

"use strict"

let db = require("./db.js");
let relay = require("../relay/relay.js");
let hue = require('../hue/hue.js');
let lamps = require('../hue/lamps.js');
let notifyMyAndroid = require('../nma/nma.js');

let setHeaterState = (state) => {
	console.log('Chauffage :', state);
	relay.setState('k4', state);
};

let animationDuration = 4 * 1000 /* ms */;

let updateRealStatus = (status, callbackIfUpdate) => {
	db.realStatus.getLast((lastRealStatus) => {
		if(status != lastRealStatus) {
			db.realStatus.add(status);
			callbackIfUpdate();
		}
	});	
};

let preparerNotification = (heaterStatus) => {
	return {
		'application' : 'Chauffage',
		'event' : 'Changement d\'état',
		'description' : heaterStatus ? 'Démarrage' : 'Arrêt',
		'priority' : 1
	};
};

module.exports = {
	on: () => {
		console.log('Démarrage chauffage');
		setHeaterState(true);
		updateRealStatus(true, () => {
			notifyMyAndroid.send(preparerNotification(true));
			hue.setState(lamps.salon, {
				"on": true,
				bri: 255,
				rgb: [ 255, 0, 0 ],
				transition: animationDuration
			});

			setTimeout(() => {
				hue.setState(lamps.salon, {
					"on": false,
					transition: 0
				});
			}, animationDuration + 1000);
		});
	},
	off: () => {
		console.log('Arrêt chauffage');
		setHeaterState(false);
		updateRealStatus(false, () => {
			notifyMyAndroid.send(preparerNotification(false));
			hue.setState(lamps.salon, {
				"on": true,
				bri: 255,
				rgb: [ 255, 0, 0 ],
				transition: 0
			});

			setTimeout(() => {
				hue.setState(lamps.salon, {
					"on": false,
					transition: animationDuration
				});
			}, 1000);
		});
	}
};