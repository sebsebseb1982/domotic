#!/usr/bin/env node

"use strict"

let secret = require('../secret.js');
let _ = require('lodash');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
	switchPowerOutlet : (outlet, state) => {
	
		let Client = require('node-rest-client').Client;
		let client = new Client();

		// set content-type header and data as json in args parameter
		let args = {
			data: {state:state},
			headers: { 
				"Content-Type": "application/json"
			}
		};

		let credentials = _.find(secret.api.users, {name:'System'}).name + ":" _.find(secret.api.users, {name:'System'}).token + "@";
		
		client.post(
			'http://' + credentials + 'localhost:9051/home/outlet/' + outlet.code, 
			args, 
			(data, response) => {
				// parsed response body as js object
				console.log(data);
				// raw response
				console.log(response);
			}
		);
	}
};