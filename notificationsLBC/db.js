#!/usr/bin/env node

"use strict"

let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let ObjectId = require('mongodb').ObjectID;
let log = require('../nma/log.js');
let _ = require('lodash');
let secret = require('../secret.js');

let url = secret.mongoUrl;

module.exports = {
  sauvegarderUneRecherche: (name, urlRecherche) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('recherches-lbc').update(
			{
				"url" : urlRecherche
			},
			{
				"name" : name,
				"url" : urlRecherche
			},
			{"upsert":true},
			(err, result) => {
				if(err) {
					log.erreur('Erreur lors de la sauvegarde de la recherche "' + name + '" (url=' + urlRecherche + ')', err);
				}
				console.log('Recherche inseree.');
				db.close();
			}
		);
	});
  },
  
  listerRecherches: (callback) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('recherches-lbc').find().toArray(
			(err, result) => {
				if(err) {
					log.erreur('Erreur lors de la lecture des recherches', err);
				}
				db.close();
				callback(result);
			}
		);
	});
  },
  
  ajouterDesItems: (items, recherche) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		let batch = db.collection('items-lbc').initializeUnorderedBulkOp()
		
		_.forEach(
			items,
			(item) => {
				batch.insert(item);
			}
		);
		
		batch.execute(function(err, result) {
			if(result.nInserted > 0) {
			console.log('Recherche "' + recherche.name + '" (' + result.nInserted + ' insertion(s))');	
			}
		  db.close();
		});
	});
  },
  
  marquerNotifie: (item) => {
	item.notifie = true;
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('items-lbc').updateOne(
			{
				"hash" : item.hash
			},
			{
				$set: { "notifie": true }
			},
			(err, result) => {
				if(err) {
					log.erreur('Erreur de du marquage notifie de l\'item "' + item.name + '"', err);
				}
				db.close();
			}
		);
	});
  },
  
  listerItems: (callback) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('items-lbc').find({ notifie: { $ne: true } }).toArray(
			(err, result) => {
				if(err) {
					log.erreur('Erreur lors de la lecture des items', err);
				}
				db.close();
				callback(result);
			}
		);
	});
  },
  
  setterRecipient: (emailAddress) => {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('recherches-lbc').updateMany(
			{},
			{
				$set: { recipients: [emailAddress] },
			},
			(err, result) => {
				if(err) {
					log.erreur('Erreur lors de la sauvegarde de la recherche "' + name + '" (url=' + urlRecherche + ')', err);
				}
				console.log('Recherche inseree.');
				db.close();
			}
		);
	});
  }
  
};