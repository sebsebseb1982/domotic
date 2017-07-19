#!/usr/bin/env node

"use strict"

let _ = require('lodash');
let cheerio = require('cheerio');
let crypto = require('crypto');
let request = require('request');
let log = require('../nma/log.js');


module.exports = {
	crawlerRecherche : (recherche, callback) => {

		request(recherche.url, function (error, response, html) {
			
			let items = [];
			
			if (!error && response.statusCode == 200) {
				let $ = cheerio.load(html);
				
				let domElements = $('a.list_item');
				
				_.forEach(domElements, (domElement) => {
					let item = createItemFromDOMElement(domElement, $, recherche);
					items.push(item);
				});
				
				callback(items);
				
			} else {
				log.erreur('Erreur lors du crawl de la recherche ' + recherche.name, error);
			}
		});
	}
};

let calculerHashItem = (item) => {
	let md5sum = crypto.createHash('md5');
	md5sum
		.update(item.name)
		/*.update(item.category)*/
		/*.update(item.place)*/
		.update(item.price);
		
	_.forEach(item.recherche.recipients, (aRecipient) => {
		md5sum.update(aRecipient);
	});	
		
	return md5sum.digest('hex');
};

let createItemFromDOMElement = (domElement, $, recherche) => {
	let imgUrl = 'http:' + $(domElement).find('.item_image .item_imagePic span').attr('data-imgsrc');
	if(imgUrl) {
		imgUrl = imgUrl.replace(/thumbs/g, 'images');
	}
	let now = new Date();
	
	let crawledPrice = _.trim($(domElement).find('section.item_infos h3.item_price').text()).match(/[0-9\s]*€/g);
	let price = crawledPrice === null ? "Prix non précisé" : crawledPrice[0];
		
	let item = {
		"professional" : $(domElement).find('.ispro').length > 0,
		"name" : _.trim($(domElement).find('section.item_infos h2').text()),
		"url" : 'https:' + $(domElement).attr('href'),
		"imgUrl" : imgUrl,
		"price" : price,
		//"date" : _.trim($($(domElement).find('section.item_infos .item_supp')[2]).text()),
		"date" : now.getDate() + '/' + (now.getMonth() + 1) + '/' +  now.getFullYear(),
		"category" : _.trim($($(domElement).find('section.item_infos .item_supp')[0]).text()),
		"place" : _.trim($($(domElement).find('section.item_infos .item_supp')[1]).text()).replace(/\s+/g, " "),
		"recherche" : recherche
	};
	
	item.hash = calculerHashItem(item);
	
	return item;
};

