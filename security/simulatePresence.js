#!/usr/bin/env node

let toctoc = require('../toctoc/toctoc.js');
let status = require('../cameras/status.js');
let cameras = require('../cameras/cameras.js');
let _ = require('lodash');
let moment = require('moment');
let notifyMyAndroid = require('../nma/nma.js');
let hue = require('../hue/hue.js');
let lamps = require('../hue/lamps.js');
let nodemailer = require('nodemailer');
let secret = require('../secret.js');

let since = moment().subtract(process.argv[2], 'minute');

let nmaNotification = (camera) => {
	notifyMyAndroid.send({
		'application' : 'CCTV',
		'event' : 'Presence detectee',
		'description' : 'camera: ' + camera.label,
		'priority' : 1
	});
};

let lightOn = () => {
	hue.setState(lamps.salon, {
		"on": true,
		bri: 255,
		rgb: [ 255, 255, 255 ]
	});

	setTimeout(() => {
		hue.setState(lamps.salon, {
			"on": false
		});
	}, 5 * 60 * 1000);
};

let sendPhotos = (camera, photos) => {
	
	let attachments = [];
	
	_.forEach(photos, (photo) => {
		attachments.push({
			path: camera.path + '/' + photo
		});
	});
	
	let mailOptions = {
	   from: 'CCTV <cctv@maison.fr>',
	   to: 'Moi <' + secret.mail.to + '>',
	   subject: 'Présence détectée (' + camera.label + ')',
	   html: 'Présence détectée (' + camera.label + ')',
	   attachments : attachments
	};
	
	let mailTransport = nodemailer.createTransport(secret.mail.smtps);
	
	mailTransport.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
};

toctoc.ifAbsent(() => {
	let camerasToSurvey = [];
	camerasToSurvey.push(_.find(cameras, {id:2}));
	camerasToSurvey.push(_.find(cameras, {id:3}));
	camerasToSurvey.push(_.find(cameras, {id:4}));
	camerasToSurvey.push(_.find(cameras, {id:5}));
	camerasToSurvey.push(_.find(cameras, {id:6}));
	
	_.forEach(camerasToSurvey, (camera) => {
		let photos = status.photosSince(camera, since);
		console.log('camera ' + camera.label + ' ' + photos.length + ' photo(s)')
		if(photos.length !== 0) {
			nmaNotification(camera);
			lightOn();
			sendPhotos(camera, photos);
		}
	});
});