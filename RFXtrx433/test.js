#!/usr/bin/env node

"use strict"

let rfx = require('./client.js');
let outlets = require('./power-outlets.js');

rfx.switchPowerOutlet(outlets.test, false);