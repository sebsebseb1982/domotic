#!/usr/bin/env node

"use strict"

let express		= require('express');
let app			= express();
let bodyParser	= require('body-parser');
let _			= require('lodash');
let meteo		= require('../meteo/meteo.js');
let nma			= require('../nma/nma.js');
let thermospi	= require('../thermospi2/control.js');
let secret		= require('../secret.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let router = express.Router();

router.use((req, res, next) => {
	let user = _.find(secret.api.users, {token: req.headers.token});
	if(user) {
		nma.send({
			'application' : 'API',
			'event' : req.originalUrl,
			'description' : user.name + ' vient d\'activer ' + req.originalUrl,
			'priority' : 2
		});
		next();
	} else {
		nma.send({
			'application' : 'API',
			'event' : 'Utilisation API frauduleuse',
			'description' : req.path,
			'priority' : 1
		});
		console.log("Missing token");
	}
});

router.get(
	'/meteo', 
	(req, res) => {
		meteo.display();
	}
);

router.post(
	'/thermospi/setpoint/increment', 
	(req, res) => {
		thermospi.incrementSetPoint(parseInt(req.body.value), (newValue) => {
			res.send(newValue.toString());
		});
	}
);

app.use('/api', router);

app.listen(9050);