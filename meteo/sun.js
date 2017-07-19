#!/usr/bin/env node

let http = require("http");
let moment = require("moment");

let getSunInfos = (callback) => {
	let options = {
		  hostname: 'api.sunrise-sunset.org',
		  port: 80,
		  path: '/json?lat=44.813632&lng=-0.585443',
		  method: 'GET'
		};
		let req = http.request(options, function(response) {
			let body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				let sunInfos = JSON.parse(body);
				callback({
					sunset: moment(sunInfos.results.sunset, 'hh:mm:ss aa'),
					sunrise: moment(sunInfos.results.sunrise, 'hh:mm:ss aa')
				});
			});
		});
		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});
		req.end();
};

module.exports = {
	ifIsDown: (callbackYes, callbackNo) => {
		getSunInfos((sunInfos) => {
			if(moment().isBetween(sunInfos.sunrise, sunInfos.sunset)) {
				callbackNo();
			} else {
				callbackYes();
			}	
		});
	},
	execute : (callback) => {
		getSunInfos((sunInfos) => {
			callback(sunInfos);
		});
	}
};