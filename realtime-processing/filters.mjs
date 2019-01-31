"use strict";

(async function initialize() {
		
	const palette = [
		"240115",
		"ef594f",
		"d8cbc7",
		"2d3a3a",
		"c64e11"
	].map(str => 
		[
			Number.parseInt(str.slice(0, 2), 16),
			Number.parseInt(str.slice(2, 4), 16),
			Number.parseInt(str.slice(4, 6), 16),
		]
	);
	// Initialize our WebAssembly Module
	const {instance} = await WebAssembly.instantiateStreaming(fetch('./filters/target/wasm32-unknown-unknown/release/filters.wasm'), {});
	const fastFilter = instance.exports.filter;

	// Put our color pallette into the instance's memory
	const memoryIn8 = new Uint8Array(instance.exports.memory.buffer, 0, 4 * palette.length);
	palette.forEach((item, index) => {
		memoryIn8.set(item, index * 3);
	});
	
	console.log(instance.exports.memory.buffer);

	function colorDistance(data, i, [r, g, b]) {
		return Math.abs(data[i++] - r) +
			Math.abs(data[i++] - g) +
			Math.abs(data[i] - b);
	}

	onmessage = function (e) {
		const imageData = e.data;
		/*
		const imageDataLocation = new Uint8ClampedArray(instance.exports.memory.buffer, 4 * palette.length, 4 * imageData.width * imageData.height);
		imageDataLocation.set(imageData.data);
		fastFilter(imageData.width, imageData.height, palette.length);
		imageData.data.set(imageDataLocation);
//		*/
	/*	
		for (let i = 0; i < imageData.data.length; i += 4) {
			let minDistance = Infinity;
			let minColor = null;
			for (let color of palette) {
				let dist = colorDistance(imageData.data, i, color);
				if (dist < minDistance) {
					minColor = color;
					minDistance = dist;
				}
			}
				imageData.data[i] = minColor[0];
				imageData.data[i + 1] = minColor[1];
				imageData.data[i + 2] = minColor[2];
		}
//		*/
		postMessage(imageData, [imageData.data.buffer]);
	};
})();