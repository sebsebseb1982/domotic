#!/usr/bin/env node

"use strict"

let db = require("./db.js");
let toctoc = require("../toctoc/toctoc.js");
let heater = require("./heater.js");
let _ = require('lodash');

let hysteresis = 1;

let updateRealSetPoint = (lastSetPoint) => {
	// On remet la consigne si on vient juste de rentrer dans la maison
	db.realSetPoint.getLast((lastRealSetPoint) => {
		if(lastSetPoint != lastRealSetPoint) {
			db.realSetPoint.add(lastSetPoint);
		}
	});
};


let update = () => {
	// On recupere la consigne de chauffage courante
	db.setPoint.getLast((lastSetPoint) => {

		// On recupere la temperature moyenne recente du RDC et de l'etage
		db.getCurrentInsideTemperature((insideTemperature) => {

			console.log('Il fait actuellement ' + _.round(insideTemperature, 1) + '°C dans la maison. Le thermostat est réglé à ' + _.round(lastSetPoint, 1) + '°C')
			
			// Si qq'un est present dans la maison
			toctoc.ifPresent(
				// Présent
				() => {
					updateRealSetPoint(lastSetPoint);
					
					if (insideTemperature < lastSetPoint - (hysteresis / 2)) {
						heater.on();
					} else if (insideTemperature > lastSetPoint + (hysteresis / 2)) {
						heater.off();
					}
				},
				// Absent
				() => {
					updateRealSetPoint(0);
					heater.off();
				}
			);
		});
	});
};

module.exports = {
	incrementSetPoint: (value, callback) => {
		db.setPoint.getLast((lastSetPoint) => {
			db.setPoint.add(lastSetPoint + value, () => {
				callback(lastSetPoint + value);	
			});
		});
	},
	addSetPoint: (value, callback) => {
		db.setPoint.add(value, () => {
			update();
			callback();
		});
	},
	update: update
};
