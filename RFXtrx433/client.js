#!/usr/bin/env node

"use strict"

let secret = require('../secret.js');
let _ = require('lodash');
let http = require('http');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
	switchPowerOutlet : (outlet, state) => {
		let options = {
		  hostname: 'localhost',
		  port: 9051,
		  path: '/home/outlet/' + outlet.code,
		  method: 'POST',
		  headers: {
			  'Content-Type': 'application/json',
			  'Authorization': 'Basic ' + new Buffer(_.find(secret.api.users, {name:'System'}).name + ':' + _.find(secret.api.users, {name:'System'}).token, "utf8").toString("base64")
		  }
		};
		let req = http.request(options, function(res) {
		  console.log('Status: ' + res.statusCode);
		  console.log('Headers: ' + JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  res.on('data', function (body) {
			console.log('Body: ' + body);
		  });
		});
		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});
		// write data to request body
		req.write('{"state":' + state + '}');
		req.end();
	}
};