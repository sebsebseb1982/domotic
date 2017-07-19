#!/usr/bin/env node

"use strict"

let _ = require('lodash');

let outlets = [
	{
		label:	'Simulateur TV',
		code:	'A4'
	},
	{
		label:	'Sapin',
		code:	'A2'
	},
	{
		label:	'Lampadaire',
		code:	'A1'
	}
];

module.exports = {
	findByCode : (code) => {
		return _.find(outlets, {code:code});
	},
	tvSimulator : outlets[0],
	test : outlets[1]
};