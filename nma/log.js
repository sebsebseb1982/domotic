#!/usr/bin/env node

"use strict"

let notifyMyAndroid = require('./nma.js');

module.exports = {
	erreur : (titre, message) => {
		console.log('Erreur', titre, message);
		notifyMyAndroid.send({
			'application' : encodeURIComponent('Alertes LBC'),
			'event' : encodeURIComponent(titre),
			'description' : encodeURIComponent(message),
			'priority' : 1
		});		
	}
};