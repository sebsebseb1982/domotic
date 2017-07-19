#!/usr/bin/env node

module.exports = {
	intFromInterval: (min, max) => {
		return Math.floor(Math.random()*(max-min+1)+min);
	}
};