#!/usr/bin/env node

"use strict"

let nodemailer = require('nodemailer');
let toctoc = require('../toctoc/toctoc.js');
let secret = require('../secret.js');

toctoc.ifPresent(() => {
	let mailOptions = {
	   from: 'Maison <noreply@maison.fr>',
	   to: secret.toctoc.notifyAddresses,
	   subject: 'Oubli ?',
	   html: '<p>L\'alarme n\'est pas enclench&eacute;e, est-ce normal ?</p>'
	};
	
	let mailTransport = nodemailer.createTransport(secret.mail.smtps);
	
	mailTransport.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
});	
