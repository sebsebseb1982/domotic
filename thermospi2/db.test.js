#!/usr/bin/env node

"use strict"

let db = require("./db.js");


db.getYesterdayOutsideTemperature((t) => {
	console.log(t);
});

