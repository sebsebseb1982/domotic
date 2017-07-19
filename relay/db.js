#!/usr/bin/env node

"use strict"

let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let secret = require('../secret.js');

let url = secret.thermospi.mongo;

module.exports = {
	getByCode : (code, callback) => {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			db.collection('relays').findOne(
				{"code": code},
				{},
				(err, result) => {
					assert.equal(err, null);
				
					callback(result);
					db.close();
				}
			);
		});		
	},
	getAll: (callback) => {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			db
				.collection('relays')
				.find({},{})
				.toArray(
					(err, results) => {
						assert.equal(err, null);
						
						callback(results);
						db.close();
					}
				);
		});	
	}
};