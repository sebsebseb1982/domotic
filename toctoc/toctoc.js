#!/usr/bin/env node

"use strict"

let MongoClient = require('mongodb').MongoClient;
let exec = require('child_process').exec;
let assert = require('assert');
let secret = require('../secret.js');

let url = secret.thermospi.mongo;

// Si ça ne fonctionne plus --> https://www.google.com/settings/security/lesssecureapps

let execIf = (expectedPresenceStatus, ifCallback, elseCallback) => {
	getLastPresence((lastPresence) => {
		if(lastPresence.status === expectedPresenceStatus) {
			ifCallback();
		} else if(elseCallback !== undefined){
			elseCallback();
		} else {
			console.log('Can\'t execute anything !')
		}
	});
};

let saveNewPresenceStatus = (presenceStatus) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('presences').insertOne(
			{
				status: presenceStatus,
				date: new Date()
			}, 
			(err, result) => {
				assert.equal(err, null);
				console.log('Presence (status=' + presenceStatus + ') inserted.');
				db.close();
			}
		);
	});
};

let getLastPresence = (callback) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('presences').findOne(
			{},
			{
				sort: [['date','desc']]
			},
			(err, result) => {
				assert.equal(err, null);

				console.log('Last presence :', result);
				callback(result);
			
				db.close();
			}
		);
	});
}

module.exports = {
	updatePresence: () => {
		getLastPresence((lastPresence) => {
			let child = exec('~/node/toctoc/toctoc.sh ' + secret.toctoc.address + ' ' + secret.toctoc.password);
			child.stdout.on('data', function(data) {
				console.log('stdout: ' + data);
			});
			child.stderr.on('data', function(data) {
				console.log('stdout: ' + data);
			});
			child.on('close', function(code) {
				let currentPresenceStatus = code == 1;
				console.log('Current presence status :', currentPresenceStatus);
				
				if(!lastPresence || lastPresence.status != currentPresenceStatus) {
					saveNewPresenceStatus(currentPresenceStatus);
				}
			});
		});
	},
	ifPresent: (ifCallback, elseCallback) => {
		execIf(true, ifCallback, elseCallback);
	},
	ifAbsent: (ifCallback, elseCallback) => {
		execIf(false, ifCallback, elseCallback);
	}
}