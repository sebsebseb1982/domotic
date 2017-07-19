#!/usr/bin/env node

"use strict"
let hue = require("node-hue-api");
let HueApi = require("node-hue-api").HueApi;
let random = require('./random.js');

let username = 'pMl1wy-N3v6E22riwXRqg7yFoG0gXSNsxiq6wLSz';

let displayResult = function(result) {
	console.log(result);
};

let displayError = function(err) {
	console.error(err);
};

let transitionDuration = 1000;
let timeout = 20 * 1000;

let findBridgeAndExec = (callback) => {
	hue.nupnpSearch(function(err, bridges) {
			if (err) {
				displayError(err);
			}
			
			callback(bridges[0]);
	});
};

let randomizeRGB = (rgb, colors, amount) => {
	return [
		Math.max(0, Math.min(255, rgb[0] + parseInt(colors.red ? random.intFromInterval(-1 * amount, amount) : 0))),
		Math.max(0, Math.min(255, rgb[1] + parseInt(colors.green ? random.intFromInterval(-1 * amount, amount) : 0))),
		Math.max(0, Math.min(255, rgb[2] + parseInt(colors.blue ? random.intFromInterval(-1 * amount, amount) : 0)))
	];
};

let setState = (lamp, state) => {
	findBridgeAndExec((bridge) => {
		let api = new HueApi(bridge.ipaddress, username, timeout);
					
		console.log('Set lamp "' + lamp.label + '" to state : ', state);
					
		api.setLightState(lamp.id, state)
			/*.then(displayResult)*/
			.fail(displayError)
			.done();				
	});
};

let readState = (lamp, callback) => {
	findBridgeAndExec((bridge) => {
		let api = new HueApi(bridge.ipaddress, username, timeout);
					
		api.lightStatusWithRGB(lamp.id, (err, status) => {
			if (err) {
				displayError(err);
			}

			callback(status);
		});			
	});
};

module.exports = {
	setState: (lamp, state) => {
		setState(lamp, state);
	},

	readState: (lamp, callback) => {
		readState(lamp, callback);
	},
	
	fluctuateRGBValue: (lamp, rgb, colors, amount, duration, options) => {
		findBridgeAndExec((bridge) => {
			let api = new HueApi(bridge.ipaddress, username, timeout);
					
			console.log('Fluctuate lamp(', lamp.id, ') RGB value', rgb, 'for', duration, 'ms');
						
			let currentTime	= 0;
				
			while(currentTime <= duration) {
				setTimeout(() => {
					setState(lamp, {
						"on": true,
						rgb: randomizeRGB(rgb, colors, amount),
						transition: parseInt(options.transitionDuration ? options.transitionDuration : transitionDuration)
					});
				}, currentTime);				
			
				currentTime += parseInt(options.transitionDuration ? options.transitionDuration : transitionDuration);
			}
				
			setTimeout(() => {
				setState(lamp, {
					"on": false
				});
			}, duration + parseInt(options.transitionDuration ? options.transitionDuration : transitionDuration) * 2);				
		});
	},
	
	fluctuateBrightness: (lamp, rgb, amount, duration, options) => {
		readState(lamp, (status) => {
			findBridgeAndExec((bridge) => {
				let api = new HueApi(bridge.ipaddress, username, timeout);
						
				console.log('Fluctuate lamp(', lamp.id, ') brightness (default :', status.state.bri, ') for', duration, 'ms');
							
				let currentTime	= 0;
					
				while(currentTime <= duration) {
					setTimeout(() => {
						setState(lamp, {
							on: true,
							bri: Math.max(0, Math.min(255, status.state.bri + random.intFromInterval(-1 * amount, amount))),
							rgb: rgb,
							transition: parseInt(options.transitionDuration ? options.transitionDuration : transitionDuration)
						});
					}, currentTime);				
				
					currentTime += parseInt(options.transitionDuration ? options.transitionDuration : transitionDuration);
				}
					
				setTimeout(() => {
					setState(lamp, {
						"on": false
					});
				}, duration + parseInt(options.transitionDuration ? options.transitionDuration : transitionDuration) * 2);				
			});	
		});
	}
};