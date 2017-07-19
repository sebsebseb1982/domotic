#!/usr/bin/env node

let hue = require('../hue/hue.js');
let toctoc = require('../toctoc/toctoc.js');

let progressiveWakeUpDuration = (process.argv[2] ? parseInt(process.argv[2]) : 45) * 60 * 1000;
let wakeUpDuration = (process.argv[3] ? parseInt(process.argv[3]) : 10) * 60 * 1000;

let startTime = 0;

let greenDelay = 30;

let blueDelay = 100;

let lamps = {
	simulateurAube : {
		id:3,
		label:'Simulteur d\'aube'	
	}
};

let red = (index) => {
	return 255;
};

let green = (index) => {
	return Math.max(0, Math.min(200, index - greenDelay));
};

let blue = (index) => {
	return Math.max(0, Math.min(200, index - blueDelay));
};

toctoc.ifAbsent(
	// Si personne dans la maison
	() => {
		console.log('Personne à la maison donc pas de reveil');
	},
	// Si nous sommes à la maison
	() => {
		for (let i = 0; i < 256 + blueDelay; i++) {
			//console.log(startTime);
			setTimeout(() => {
				hue.setState(lamps.simulateurAube, {
					on: true,
					bri: Math.round(Math.max(0, Math.min(255, i * (256 / (256 + blueDelay))))),
					rgb: [
						red(i), 
						green(i), 
						blue(i)
					]
				});
			}, startTime);
			
			startTime = i * Math.round(progressiveWakeUpDuration / (256 + blueDelay));
		}

		setTimeout(() => {
			hue.setState(lamps.simulateurAube, {
				on: false
			});
		}, progressiveWakeUpDuration + wakeUpDuration);
	}
);

