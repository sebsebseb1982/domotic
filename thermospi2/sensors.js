#!/usr/bin/env node

"use strict"

let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let secret = require('../secret.js');
let db = require('./db.js');
let fs = require('fs');
let nma = require('../nma/nma.js');
let _ = require('lodash');

let url = secret.thermospi.mongo;

let getSensors = (criteria, callback) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db
			.collection('sensors')
			.find(criteria,{})
			.toArray(
				(err, results) => {
					assert.equal(err, null);
					
					callback(results);
					db.close();
				}
			);
	});	
};

let extractCRCStatus = (crcLine) => {
	let chunks = crcLine.split(' ');
	return chunks[chunks.length - 1] === "YES";
};

let extractTemperature = (temperatureLine) => {
	let chunks = temperatureLine.split('=');
	return parseFloat(chunks[1]) / 1000;
};

let read = (sensor) => {
	let lines = fs.readFileSync(sensor.path).toString().split('\n');
	return {
		crcOK: extractCRCStatus(lines[0]),
		temperature: extractTemperature(lines[1])
	}
};

module.exports = {
	getBySite: (site, callback) => {
		getSensors({"site": site}, callback);
	},
	getAll: (callback) => {
		getSensors({}, callback);
	},
	recordBySite: (site) => {
		getSensors({"site": site}, (sensors) => {
			let temperatures = [];
			
			_.forEach(sensors, (aSensor) => {
				
				let sensorData = {};
				do {
					sensorData = read(aSensor);
				} while (!sensorData.crcOK || sensorData.temperature > 75);
				
				console.log('Sonde "' + aSensor.label + '" = ' + sensorData.temperature + '°C');
				temperatures.push({
					temperature: sensorData.temperature,
					probe: aSensor.id,
					date: new Date()
				});
			});

			db.recordTemperatures(temperatures);			
		});
	}
};