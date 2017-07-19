#!/usr/bin/env node

"use strict"

let query = require('./query.js');
let meteoFrance = require('./data/meteo-france.js');
let hue = require('../hue/hue.js');
let lamps = require('../hue/lamps.js');
let random = require('../hue/random.js');
let thermospi = require('../thermospi2/db.js');
let notifyMyAndroid = require('../nma/nma.js');
let _ = require('lodash');
let moment = require("moment");
let async = require('async');

let meteoLamp = lamps.salon;

let animationDuration = 30 * 1000;

let todayAverageTemperature = (meteo) => {
	return _.mean(
		[
			meteo['24to03'].temperature,
			meteo['03to06'].temperature,
			meteo['06to09'].temperature,
			meteo['09to12'].temperature,
			meteo['12to15'].temperature,
			meteo['15to18'].temperature,
			meteo['18to21'].temperature, 
			meteo['21to24'].temperature
		]
	);
};

let displayTemperature = (meteoInfos) => {
	let deltaMin = -3;
	let deltaMax = +3;
	
	if(meteoInfos.today.variation <= deltaMin) {
		hue.setState(meteoLamp, {
			"on": true,
			bri: 255,
			rgb: [ 0, 0, 255 ]
		});
	} else if( meteoInfos.today.variation > deltaMin && meteoInfos.today.variation <= 0) {
		
		let ratio = (meteoInfos.today.variation - deltaMin) / (0 - deltaMin);
		
		hue.setState(meteoLamp, {
			"on": true,
			bri: 255,
			rgb: [ Math.round(ratio * 255), Math.round(ratio * 255), 255]
		});
	} else if( meteoInfos.today.variation > 0 && meteoInfos.today.variation <= deltaMax) {
		
		let ratio = (meteoInfos.today.variation - 0) / (deltaMax - 0);
		
		hue.setState(meteoLamp, {
			"on": true,
			bri: 255,
			rgb: [ 255, Math.round((1 - ratio) * 255), Math.round((1 - ratio) * 255)]
		});
	} else {
		hue.setState(meteoLamp, {
			"on": true,
			bri: 255,
			rgb: [ 255, 0, 0 ]
		});
	}
	
	setTimeout(() => {
        hue.setState(meteoLamp, {
			"on": false
		});
    }, animationDuration);
};


let prepareMeteo = (callback) => {
	async.parallel(
		{
			averageError : thermospi.forecast.getAverageError,
			today : meteoFrance.aujourdHui,
			yesterday : thermospi.getYesterdayOutsideTemperature
		},	
		(err, infos) => {
			assert.equal(err, null);
			
			infos.today.average = todayAverageTemperature(infos.today);
			infos.today.variation = (infos.today.average + infos.averageError) - infos.yesterday;
			
			// Enregistre les prévisions pour aujourd'hui
			thermospi.forecast.updateForecast(infos.today.average);
			
			// Enregistre la température effectivement mesurée hier
			thermospi.forecast.updateMeasured(infos.yesterday, moment().subtract(1, 'days').toDate());
			
			callback(infos);
		}
	);	
};

module.exports = {
	display: () => {
		prepareMeteo(displayTemperature);
	},
	notify: () => {
		prepareMeteo((meteoInfos) => {
			let preparerNotification = (meteoInfos) => {
				return {
					'application' : 'Météo',
					'event' : 'Prévision quotidienne',
					'description' : _.round(meteoInfos.today.average + meteoInfos.averageError) + '°C (Variation ' + _.round(meteoInfos.today.variation) + '°C)',
					'priority' : 1
				};
			};
			
			notifyMyAndroid.send(
				preparerNotification(meteoInfos)
			);
		});
	}
};