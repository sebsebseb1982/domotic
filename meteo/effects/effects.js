#!/usr/bin/env node

"use strict"

let hue = require('../../hue/hue.js');
let lamps = require('../../hue/lamps.js');
let random = require('../../hue/random.js');

let meteoLamp = lamps.chambre;

let animationDuration = 30 * 1000;

module.exports = {
	thunderstorm: () => {
		let clouds = [255, 255, 255];
		let thunder = [141, 76, 255];
		let thunderDuration = 20;
		
		let defaultState = {
			on: true,
			bri: 150,
			rgb: clouds
		};
		
		hue.setState(meteoLamp, defaultState);
		
		hue.fluctuateBrightness(
			meteoLamp, 
			clouds, 
			40, 
			animationDuration,
			{
				transitionDuration: 4000
			}
		);
		
		for (let i = 0; i < 9; i++) {
			let thunderTime = random.intFromInterval(0, animationDuration);
			
			setTimeout(() => {
				hue.setState(
					meteoLamp, 
					{
						on: true,
						bri: 255,
						rgb: thunder,
						transition: 0
					}
				);
			}, thunderTime);
			
			setTimeout(() => {
				hue.setState(meteoLamp, defaultState);
			}, thunderTime + thunderDuration);
		}
	},
	rain: () => {
		
		let water = [0, 50, 255];
		
		let defaultState = {
			on: true,
			bri: 255,
			rgb: water
		};
		
		hue.setState(meteoLamp, defaultState);
		
		hue.fluctuateRGBValue(
			meteoLamp, 
			water, 
			{
				red: false,
				green: true,
				blue: false
			}, 
			50, 
			animationDuration,
			{
				transitionDuration: 1000
			}
		);	
	},
	sun: () => {
		let sun = [255, 200, 0];
		
		let defaultState = {
			on: true,
			bri: 255,
			rgb: sun
		};
		
		hue.setState(meteoLamp, defaultState);
		
		hue.fluctuateRGBValue(
			meteoLamp, 
			sun, 
			{
				red: false,
				green: true,
				blue: false
			}, 
			20, 
			animationDuration,
			{}
		);	
	}
};
