#!/usr/bin/env node

"use strict"

let lamps = require('./lamps.js');

lamps.getById(1, (lamp) => {
	console.log(lamp);
});