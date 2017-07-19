#!/usr/bin/env node

let exec = require('child_process').exec;
let secret = require('../secret.js');

module.exports = {
	getStatus : (callback) => {
		let child = exec('~/node/wifi/wifi.getStatus.sh ' + secret.router.user + ' ' + secret.router.ip + ' ' + secret.router.password);

		let retour;
		
		child.stdout.on('data', function(data) {
			retour = data;
		});
		child.stderr.on('data', function(data) {
			//FIXME Mettre un appel nma
			console.log(data);
		});
		child.on('close', function(code) {
			callback(retour === "0x0000\n");
		});
	},
	setStatus : (status, callback) => {
		let command = status ? 'on' : 'off';
		console.log('command', command);
		let child = exec('~/node/wifi/wifi.setStatus.sh ' + secret.router.user + ' ' + secret.router.ip + ' ' + secret.router.password + ' ' + command);

		child.stdout.on('data', function(data) {
			console.log(data);
		});
		child.stderr.on('data', function(data) {
			//FIXME Mettre un appel nma
			console.log(data);
		});
		child.on('close', function(code) {
			callback(code);
		});
	}
}