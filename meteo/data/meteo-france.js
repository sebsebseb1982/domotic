#!/usr/bin/env node

"use strict"

let _ = require('lodash');
let cheerio = require('cheerio');
let request = require('request');
let log = require('../../nma/log.js');

let urlMeteoFrance = 'http://www.meteofrance.com/previsions-meteo-france/talence/33400';

module.exports = {
	aujourdHui : (callback) => {
		request(urlMeteoFrance, function (error, response, html) {
			if (!error && response.statusCode == 200) {
				let $ = cheerio.load(html);
				let domMeteo = $('#detail-day-01');
				let meteo = createMeteoFromDOMElement(domMeteo, $);
				
				callback(null, meteo);
			} else {
				log.erreur('Erreur lors du crawl de Meteo France (' + urlMeteoFrance + ')', error);
			}
		});
	}
};

let readMeteoBetween = (between, domElement, $) => {
	let temperatureRaw = $(domElement).find('tr')[9];
	let temperature = $(temperatureRaw).find('.' + between + ' span').text();
	
	let weatherRaw = $(domElement).find('tr')[1];
	let weather = $(weatherRaw).find('.' + between + ' span').text();
	
	return {
		"temperature" : parseInt(temperature.substring(0, temperature.length - 2)),
		"weather" : weather
	}
};

let createMeteoFromDOMElement = (domElement, $) => {
	let meteo = {
		"24to03": readMeteoBetween('s-24-to-03', domElement, $),
		"03to06": readMeteoBetween('s-03-to-06', domElement, $),
		"06to09": readMeteoBetween('s-06-to-09', domElement, $),
		"09to12": readMeteoBetween('s-09-to-12', domElement, $),
		"12to15": readMeteoBetween('s-12-to-15', domElement, $),
		"15to18": readMeteoBetween('s-15-to-18', domElement, $),
		"18to21": readMeteoBetween('s-18-to-21', domElement, $),
		"21to24": readMeteoBetween('s-21-to-24', domElement, $)
	};
	
	return meteo;
};