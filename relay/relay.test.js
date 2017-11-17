#!/usr/bin/env node

"use strict"

let relay = require("./relay.js");
let db = require('./db.js');
let _ = require('lodash');

relay.initRelayBoard();

let start = 10000;
let delta = 1500;

/*db.getAll((relays) => {
	_.forEach(relays, (aRelay) => {
		setTimeout(() => {
			relay.setState(aRelay.code, true);
		}, start);	
		
		setTimeout(() => {
			relay.setState(aRelay.code, false);
		}, start + delta);
		
		start += 2 * delta;
	});
});*/

relay.impulse('k3', 100);