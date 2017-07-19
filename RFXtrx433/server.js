#!/usr/bin/env node

"use strict"

let express		= require('express');
let app			= express();
let bodyParser	= require('body-parser');
let _			= require('lodash');
let nma			= require('../nma/nma.js');
let secret		= require('../secret.js');
let rfxcom 		= require('rfxcom');
let outlets 	= require('./power-outlets.js');
let assert		= require('assert');
let hue			= require('../hue/hue.js');
let lamps		= require('../hue/lamps.js');
let wifi		= require('../wifi/wifi.js');
let thermostat	= require('../thermospi2/thermostat.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let router = express.Router();

let rfxtrx = new rfxcom.RfxCom("/dev/ttyRFX433", {debug: true});
let lighting1 = new rfxcom.Lighting1(rfxtrx, rfxcom.lighting1.ENERGENIE_5_GANG);

rfxtrx.initialise(() => {
	console.log('RFXcom initialized !')
});

rfxtrx.on("chime1", function (evt) {
  console.log("chime1 !!!", evt);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  
  // intercept OPTIONS method
	if ('OPTIONS' == req.method) {
	  res.send(200);
	}
	else {
	  next();
	}

});

router.use((req, res, next) => {
	console.log('token:',req.headers);
	let user = _.find(secret.api.users, {token: req.headers.token});
	if(user) {
		nma.send({
			'application' : 'API',
			'event' : 'Utilisation API par ' + user.name,
			'description' : req.path,
			'priority' : 1
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
		res.send(403);
	}
});

router.post(
	'/outlet/:id', 
	(req, res) => {
		let state = Boolean(req.body.state);
		let id = req.params.id;
		let outlet = outlets.findByCode(id);
		assert.notEqual(outlet, undefined, 'Outlet with ID ' + id + ' unknown !');
		console.log('Switching ' + state ? 'ON' : 'OFF' + ' "' + outlet.label +'" (ID:' + outlet.code + ')');
		if(state) {
			lighting1.switchOn(id);	
		} else {
			lighting1.switchOff(id);
		}
		res.send(200);
	}
);

router.get(
	'/wifi', 
	(req, res) => {
		wifi.getStatus((status) => {
			res.send({'status' : status});
		});
	}
);

router.post(
	'/wifi', 
	(req, res) => {
		let state = Boolean(req.body.state);
		console.log('Switching WIFI ' + state ? 'ON' : 'OFF');
		wifi.setStatus(state, () => {
			res.send(200);
		});
	}
);

router.post(
	'/thermostat/setpoint', 
	(req, res) => {
		let setPoint = parseFloat(req.body.value);
		assert.notEqual(setPoint, undefined, 'SetPoint undefined !');
		thermostat.addSetPoint(setPoint, () => {
			res.send(200);
		});
	}
);

router.get(
	'/lamps/:code/state', 
	(req, res) => {
		lamps.getByCode(req.params.code, (lamp) => {
			assert.notEqual(lamp, undefined, 'Lamp with code "' + req.params.code + '" unknown !');
			hue.readState(lamp, (state) => {
				res.send(state);	
			});
		});
	}
);

app.use('/home', router);

app.listen(9051);