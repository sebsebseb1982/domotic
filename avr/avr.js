#!/usr/bin/env node

"use strict"

let http = require("http");

let Client = require('node-rest-client').Client;
let client = new Client();
let parser = require('xml2json');

let avrHTTPAddress = 'http://192.168.1.152';

let sendCommandToAVR = (command) => {
	
	console.log('Send command \'' + command + '\' to AVR');

	// set content-type header and data as json in args parameter
	let args = {
		data: 'cmd0=' + encodeURI(command) + '&cmd1=aspMainZone_WebUpdateStatus%2F'
	};

	client.post(
		avrHTTPAddress + '/MainZone/index.put.asp', 
		args, 
		(data, response) => {
			// parsed response body as js object
			//console.log(data);
			// raw response
		}
	);
};

let getStatus = (callback) => {
	client.get(
		avrHTTPAddress + '/goform/formMainZone_MainZoneXml.xml',  
		(data, response) => {
			// parsed response body as js object
			//console.log(data);
			// raw response
			callback(JSON.parse(parser.toJson(data)));
		}
	);
};

module.exports = {
	on : () => {
		sendCommandToAVR('PutZone_OnOff/ON');
	},
	off : () => {
		sendCommandToAVR('PutZone_OnOff/OFF');
	},
	tuner : () => {
		sendCommandToAVR('PutZone_InputFunction/TUNER');
	},
	getStatus : (callback) => {
		getStatus(callback);
	},
	setVolume : (volumedB) => {
		getStatus((status) => {
			let initialVolumedB = status.item.MasterVolume.value;
			let deltaVolumedB = volumedB - initialVolumedB

			let ellapsedTime = 0;
			
			for (let volumeChanges = 0; volumeChanges < Math.abs(deltaVolumedB/0.5); volumeChanges++) {
				//setTimeout(() => {
					if(deltaVolumedB < 0) {
						sendCommandToAVR('PutMasterVolumeBtn/<');	
					} else {
						sendCommandToAVR('PutMasterVolumeBtn/>');
					}
				//}, volumeChanges * 100);
			}	
		});
	}
};