#!/usr/bin/env node

"use strict"

let secret = require('../secret.js');
let http = require('http');



let getSid = () => {
	return new Promise((resolve, reject) => {
		let options = {
		  hostname: secret.synology.ip,
		  port: secret.synology.port,
		  path: `/webapi/auth.cgi?api=SYNO.API.Auth&method=Login&version=3&account=${secret.synology.user}&passwd=${secret.synology.password}&session=SurveillanceStation&format=sid`,
		  method: 'GET'
		};
		
		let req = http.request(options, function(res) {
		  res.setEncoding('utf8');
		  res.on('data', function (body) {
			resolve(JSON.parse(body).data.sid);
		  });
		});
		req.on('error', function(e) {
		  reject();
		});
		req.end();
	});
}

module.exports = {
	setHomeMode : (state) => {
		getSid()
			.then((sid) => {
				let options = {
				  hostname: secret.synology.ip,
				  port: secret.synology.port,
				  path: `/webapi/entry.cgi?api=SYNO.SurveillanceStation.HomeMode&version=1&method=Switch&on=${state ? 'true' : 'false'}&_sid=${sid}`,
				  method: 'GET'
				};
				
				let req = http.request(options);
				req.end();
			});
	}
};