#!/usr/bin/env node

let miio = require('miio');


// Create a new device over the given address
miio.device({
	address: '192.168.1.193',
	token: '3147306b4a624b367a4b38574d6d7032'
}).then(device => {
	if(device.hasCapability('power')) {
		console.log('power is now', device.power);
		return device.setPower(! device.power);
	}
}).catch(console.error);