"use strict";

function colorDistance(a, i, b) {
	return Math.abs(a[i] - b[0]) +
		Math.abs(a[++i] - b[1]) +
		Math.abs(a[++i] - b[2]);
}

const pallete = [
	"faa916",
	"fbfffe",
	"6d676e",
	"1b1b1e",
	"96031a"
].map(str => 
	[
		Number.parseInt(str.slice(0, 2), 16),
		Number.parseInt(str.slice(2, 4), 16),
		Number.parseInt(str.slice(4, 6), 16),
	]
); 

onmessage = function (e) {
	const imageData = e.data;
	for (let i = 0; i < imageData.data.length; i += 4) {
		let minDistance = Infinity;
		let minColor = null;
		for (let color of pallete) {
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
	postMessage(imageData, [imageData.data.buffer]);
};