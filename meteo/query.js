#!/usr/bin/env node

"use strict"
let http = require("https");

module.exports = {
  getDailyMeteo: (callback) => {
	  
	let options = {
	  hostname: 'api.darksky.net',
	  port: 443,
	  path: '/forecast/1317ff94a12b5c6b30230da921c94725/44.8059256,-0.5850085?units=ca',
	  method: 'GET'
	};
	
	let currentMeteo;
	
	let req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  
	  let body = '';
	  
	  res.on('data', function (data) {
		body += data;
	  });
	  
	  res.on('end', function (data) {
		callback(JSON.parse(body).daily.data[0]);
	  });
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	req.end();
  }
};