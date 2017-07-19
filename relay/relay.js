#!/usr/bin/env node

"use strict"

let exec = require('child_process').execSync;
let db = require('./db.js');
let _ = require('lodash');

let callback = (error, stdout, stderr) => {
	console.log('error', error);
	console.log('stdout', stdout);
	console.log('stderr', stderr);
};

let executeScript = (script) => {
	console.log('execute :', script);
	exec(script, callback);
};

module.exports = {
	setState : (code, state) => {
		db.getByCode(code, (relay) => {
			if(state) {
				console.log('Activating relay ' + relay.label + "(code : " + relay.code + ", gpio : " + relay.gpio + " & pin : " + relay.pin + ")");
				executeScript("sudo gpio write " + relay.gpio + " 1");
			} else {
				console.log('Desactivating relay ' + relay.label + "(code : " + relay.code + ", gpio : " + relay.gpio + " & pin : " + relay.pin + ")");
				executeScript("sudo gpio write " + relay.gpio + " 0");
			}
		});
	},
	initRelayBoard: () => {
		db.getAll((relays) => {
			_.forEach(relays, (relay) => {
				executeScript("sudo gpio mode " + relay.gpio + " out");
				executeScript("sudo gpio write " + relay.gpio + " 0");
			});
		});
	}
};