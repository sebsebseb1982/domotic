#!/usr/bin/env node

"use strict"

let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let ObjectId = require('mongodb').ObjectID;
let log = require('../nma/log.js');
let _ = require('lodash');
let secret = require('../secret.js');
let moment = require("moment");

let url = secret.thermospi.mongo;

module.exports = {
	recordTemperatures: (temperatures) => {
		MongoClient.connect(url, (err, db) => {
			assert.equal(null, err);

			let batch = db.collection('temperatures').initializeUnorderedBulkOp()
			
			_.forEach(
				temperatures,
				(aTemperature) => {
					batch.insert(aTemperature);
				}
			);
			
			batch.execute(function(err, result) {
			  console.log(temperatures.length + ' temperature(s) recorded.');
			  db.close();
			});
		});
	},
	setPoint : {
		add: (setPoint, callback) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('setPoints').insertOne(
					{
						value: setPoint,
						date: new Date()
					}, 
					(err, result) => {
						assert.equal(err, null);
						console.log('Setpoint (value=' + setPoint + ') inserted.');
						callback();
						db.close();
					}
				);
			});
		},
		getLast: (callback) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('setPoints').findOne(
					{},
					{
						sort: [['date','desc']]
					},
					(err, result) => {
						assert.equal(err, null);

						callback(result.value);
						db.close();
					}
				);
			});
		}
	},
	realSetPoint : {
		add: (setPoint) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('realSetPoints').insertOne(
					{
						value: setPoint,
						date: new Date()
					}, 
					(err, result) => {
						assert.equal(err, null);
						console.log('Real setpoint (value=' + setPoint + ') inserted.');
						db.close();
					}
				);
			});
		},
		getLast: (callback) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('realSetPoints').findOne(
					{},
					{
						sort: [['date','desc']]
					},
					(err, result) => {
						assert.equal(err, null);

						callback(result !== null ? result.value : 0);
						db.close();
					}
				);
			});
		}
	},
	realStatus : {
		add: (status) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('realStatus').insertOne(
					{
						value: status,
						date: new Date()
					}, 
					(err, result) => {
						assert.equal(err, null);
						console.log('Real status (value=' + status + ') inserted.');
						db.close();
					}
				);
			});
		},
		getLast: (callback) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('realStatus').findOne(
					{},
					{
						sort: [['date','desc']]
					},
					(err, result) => {
						assert.equal(err, null);

						callback(result !== null ? result.value : false);
						db.close();
					}
				);
			});
		}
	},
	getCurrentInsideTemperature: (callback) => {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
		    db.collection('temperatures').find(
				{
					"probe":{$in:[2,3]}
				},
				{
					sort: [['date','desc']],
					limit: 2
				}
			).toArray((err, results) => {
				assert.equal(err, null);
				
				callback(_.mean(_.map(results, 'temperature')));
				db.close();
			});
		});
	},
	getCurrentOutsideTemperature: () => {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
		    
			db.close();
		});
	},
	getYesterdayOutsideTemperature: (callback) => {
		
		var today = new Date();
		var yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
		    db.collection('temperatures').find(
				{
					"probe": 1,
					"date": { $gte : yesterday, $lt : today }
				},
				{
					sort: [['date','desc']]
				}
			).toArray((err, results) => {
				callback(err, _.mean(_.map(results, 'temperature')));
				db.close();
			});
		});
	},
	forecast: {
		updateForecast: (forecast) => {
			let now = new Date();
			let yesterday23h59 = moment(now).millisecond(0).second(0).minute(59).hour(23).subtract(1, 'days');
			let today23h59 = moment(now).millisecond(0).second(0).minute(59).hour(23);
			
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('forecasts').updateOne(
					{
						"date": { 
							$gte : yesterday23h59.toDate(), 
							$lt : today23h59.toDate() 
						}
					},
					{
						$set : {
							forecast: forecast	
						},
						$setOnInsert : {
							date: now
						}
					}, 
					{
						upsert: true
					},
					(err, result) => {
						assert.equal(err, null);
						db.close();
					}
				);
			});
		},
		updateMeasured: (measuredTemperature, date) => {
			
			console.log('Update measured temperature (' + measuredTemperature + '°c) for ' + date);
			
			let yesterday23h59 = moment(date).millisecond(0).second(0).minute(59).hour(23).subtract(1, 'days');
			let today23h59 = moment(date).millisecond(0).second(0).minute(59).hour(23);
			
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('forecasts').update(
					{
						"date": { $gte : yesterday23h59.toDate(), $lt : today23h59.toDate() }
					},
					{
						$set : {
							"measured": measuredTemperature	
						},
						$setOnInsert : {
							"date": date
						}
					}, 
					{
						upsert: true
					},
					(err, result) => {
						assert.equal(err, null);
						db.close();
					}
				);
			});
		},
		calculateErrors: () => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('forecasts').find(
					{
						"measured": {$exists: true},
						"forecast": {$exists: true},
						"error": {$exists: false}
					},
					{}
				).toArray((err, results) => {
					assert.equal(err, null);
					_.forEach(results, (forecast) => {
						let delta = forecast.measured - forecast.forecast;
						
						db.collection('forecasts').update(
							{
								"_id": forecast._id
							},
							{
								$set : {
									"error": _.round(delta, 1)
								}
							}, 
							{},
							(err, result) => {
								assert.equal(err, null);
							}
						);
					});
					
					console.log('Calculate', results.length, 'error(s)');
					
					db.close();
				});
			});
		},
		getAverageError: (callback) => {
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				db.collection('forecasts').find(
					{
						"error": {$exists: true}
					},
					{
						sort: [['date','desc']],
						limit: 7
					}
				).toArray((err, results) => {

					let averageError = _.mean(_.map(results, 'error'));
					
					console.log('Average error', averageError, '°c');
					
					callback(err, averageError);
					
					db.close();
				});
			});
		}
	}
};