#!/usr/bin/env node

"use strict"

var http = require("http");

let getQueryParams = (notification) => {
	
	let queryParams = '&application=' + encodeURI(notification.application);
	queryParams += '&event=' + encodeURI(notification.event);
	if(notification.description) {
		queryParams += '&description=' + encodeURI(notification.description);
	}
	if(notification.url) {
		queryParams += '&url=' + notification.url;
	}
	queryParams += '&priority=1';
	
	return queryParams;
};

module.exports = {
  send: (notification) => {
	var options = {
	  /*hostname: 'www.notifymyandroid.com',*/
	  hostname: 'notifymyandroid.appspot.com',
	  port: 80,
	  path: '/publicapi/notify?apikey=9ea7e06ace8a9752fda94e172eb95b574a369803f7778ecd' + getQueryParams(notification),
	  method: 'POST',
	  headers: {
		  'Content-Type': 'application/json',
		  'Content-Length': '0'
	  }
	};
	var req = http.request(options, function(res) {
	  console.log('Status: ' + res.statusCode);
	  //console.log('Headers: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (body) {
		console.log('Body: ' + body);
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	// write data to request body
	req.end();

  }
};