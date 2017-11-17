#!/usr/bin/env node

"use strict"

let paradox = require('./paradox.js');
let Client = require('node-rest-client').Client;
let client = new Client();
let secret = require('../secret.js');

let generateSES = (callback) => {
	client.get(
		'http://' + secret.paradox.host + '/login_page.html', 
		{}, 
		(data, response) => {
			if(Buffer.isBuffer(data)){
				data = data.toString('utf8');
			}
			//console.log(data);
			
			let myRegexp = /loginaff\("([A-Z0-9]*)"/g;
			let match = myRegexp.exec(data);
			if(match) {
				let ses = match[1];
				console.log('SES:', ses);
				callback(ses);	
			} else {
				console.log('Erreur, impossible de lire un token SES depuis la page suivante :', data);
			}
		}
	);
};

let loginAndExecute = (callback) => {
	generateSES((ses) => {
		let credentials = paradox.getCredentials(secret.paradox.userCode, secret.paradox.modulePassword, ses);
		
		console.log('u:', credentials.u);
		console.log('p:', credentials.p);
		
		client.get(
			'http://' + secret.paradox.host + '/default.html?u=' + credentials.u + '&p=' + credentials.p, 
			{}, 
			(data, response) => {
				callback();
			}
		);	
	});
};

let logout = () => {
	client.get(
		'http://' + secret.paradox.host + '/logout.html', 
		{}, 
		(data, response) => {}
	);
};

module.exports = {
	arm: () => {
		loginAndExecute(() => {
			setTimeout(() => {
				client.get(
					'http://' + secret.paradox.host + '/statuslive.html?area=00&value=r', 
					{}, 
					(data, response) => {
						logout();
					}
				);
			}, 10 * 1000);
		});
	},
	getStatus: (callback) => {
		
	}
}