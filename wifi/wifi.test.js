#!/usr/bin/env node

"use strict"

let wifi = require("./wifi.js");

wifi.setStatus(
	true,
	(code) => {
		
	}
);

setTimeout(function(){ 
	wifi.getStatus((status) => {
		console.log(status);
	});
}, 3000);