#!/usr/bin/env node

"use strict"

let avr = require("./avr.js");


avr.status((status) => {
	console.log();
});
