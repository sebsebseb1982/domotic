#!/usr/bin/env node

"use strict"

var wpi = require('wiring-pi');

wpi.pinMode(22, wpi.OUTPUT);
wpi.pinMode(23, wpi.OUTPUT);
wpi.pinMode(24, wpi.OUTPUT);
wpi.pinMode(25, wpi.OUTPUT);

wpi.digitalWrite(22, 1);
wpi.digitalWrite(23, 1);
wpi.digitalWrite(24, 1);
wpi.digitalWrite(25, 1);