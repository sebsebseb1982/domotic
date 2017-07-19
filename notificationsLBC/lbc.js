#!/usr/bin/env node

"use strict"

let _ = require('lodash');
let db = require('./db.js');
let crawl = require('./crawl.js');

db.listerRecherches((recherches) => {
	_.forEach(
		recherches, 
		(uneRecherche) => {
			crawl.crawlerRecherche(
				uneRecherche, 
				(items) => {
					if(!_.isEmpty(items)) {
						console.log('Try to insert', items.length, 'result(s) for query', uneRecherche.name);
						db.ajouterDesItems(items, uneRecherche);
					}
				}
			);
		}
	);
});

