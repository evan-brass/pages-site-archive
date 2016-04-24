const
maxTries = 30; // 10 for dev, 30 for release
const
reallySmall = 0.00000001;

var canvas, context, width, height, aspectRatio, unitHeight, unitWidth, image, data;

// Mandelbrot with period
function createMandelbrotWithPeriod(py) {
	py = py || 0;
	// iterate through each pixel in the row
	for (var px = 0; px < image.width; ++px) {
		var color = periodColorAt(px, py);
		data[(py * image.width * 4) + (px * 4)] = color.r; // Red
		data[(py * image.width * 4) + (px * 4) + 1] = color.g; // Green
		data[(py * image.width * 4) + (px * 4) + 2] = color.b; // Blue
		data[(py * image.width * 4) + (px * 4) + 3] = 255; // Alpha
	}
	context.putImageData(image, 0, 0);

	if (py < image.height) {
		setTimeout(createMandelbrotWithPeriod.bind(this, ++py), 1);
	}
}
var periods = [];
function periodColorAt(x, y) {
	var a, b;
	a = (x / width) * unitWidth - unitWidth / 2;
	b = (y / height) * unitHeight - unitHeight / 2;

	var period = mandelPeriod(math.complex(a, b));
	periods.push(period);
	var intensity;
	if (period >= 0) { // Regular period
		intensity = Math.floor(period / maxTries * 255);
		return {
			r : intensity,
			g : intensity,
			b : intensity
		}
	} else if (period == -1) { // Spiral
		return {
			r : 0,
			g : 0,
			b : 255
		}
	} else if (period == -2) {
		return {
			r : 255,
			g : 0,
			b : 0,
		}
	} else { // Not in the set
		return {
			r : 0,
			g : 0,
			b : 0
		}
	}
}

function mandelPeriod(c, previousAnswers, tries) {
	previousAnswers = previousAnswers || [];
	tries = tries || 0;
	if ((c.re * c.re + c.im * c.im) > 4) {
		return -3;
	}

	if (previousAnswers.slice(0, previousAnswers.length - 1).some(
			function(item) {
				return isClose(c, item);
			})) {
		// period is the distance between current c and a previous c
		var period = previousAnswers.length
				- previousAnswers.reverse().findIndex(function(item) {
					return isClose(c, item);
				});
		return tries;
	}

	if (previousAnswers.length > 0
			&& isClose(c, previousAnswers[previousAnswers.length - 1])) {
		return -1;
	}

	++tries;
	if (tries > maxTries) {
		return -2;
	}

	previousAnswers.push(c);
	return mandelPeriod(math.add(math.square(c), previousAnswers[0]),
			previousAnswers, tries);
}

// Gradiented mandelbrot
function createGradientMandelbrot(py) {
	py = py || 0;
	// iterate through each pixel in the row
	for (var px = 0; px < image.width; ++px) {
		var color = gradientColorAt(px, py);
		data[(py * image.width * 4) + (px * 4)] = color.r; // Red
		data[(py * image.width * 4) + (px * 4) + 1] = color.g; // Green
		data[(py * image.width * 4) + (px * 4) + 2] = color.b; // Blue
		data[(py * image.width * 4) + (px * 4) + 3] = 255; // Alpha
	}
	context.putImageData(image, 0, 0);

	if (py < image.height) {
		setTimeout(createGradientMandelbrot.bind(this, ++py), 1);
	}
}

function mandelbrotFailIter(c, previousAnswers, tries) {
	previousAnswers = previousAnswers || [];
	tries = tries || 0;

	if ((c.re * c.re + c.im * c.im) > 4) {
		return tries;
	}

	if (previousAnswers.slice(0, previousAnswers.length - 1).some(
			function(item) {
				return isClose(c, item);
			})) {
		return -1;
	}

	++tries;
	if (tries > maxTries) {
		return -1;
	}

	previousAnswers.push(c);
	return mandelbrotFailIter(math.add(math.square(c), previousAnswers[0]),
			previousAnswers, tries);
}

function gradientColorAt(x, y) {
	var a, b;
	a = (x / width) * unitWidth - unitWidth / 2;
	b = (y / height) * unitHeight - unitHeight / 2;

	var failIteration = mandelbrotFailIter(math.complex(a, b));
	var intensity;
	if (failIteration != -1) {
		intensity = Math.floor(failIteration / maxTries * 255);
	} else {
		intensity = 0;
	}
	return {
		r : intensity,
		g : intensity,
		b : intensity
	};
}

// Plain Black and white
function isMandelbrot(c) {
	return (mandelbrotFailIter(c) == -1);
}

function colorAt(x, y) {
	var a, b;
	a = (x / width) * unitWidth - unitWidth / 2;
	b = (y / height) * unitHeight - unitHeight / 2;
	if (isMandelbrot(math.complex(a, b))) {
		return {
			r : 0,
			g : 0,
			b : 0
		};
	} else {
		return {
			r : 255,
			g : 255,
			b : 255
		};
	}
}

function createMandelbrot(py) {
	py = py || 0;
	// iterate through each pixel in the row
	for (var px = 0; px < image.width; ++px) {
		var color = colorAt(px, py);
		data[(py * image.width * 4) + (px * 4)] = color.r; // Red
		data[(py * image.width * 4) + (px * 4) + 1] = color.g; // Green
		data[(py * image.width * 4) + (px * 4) + 2] = color.b; // Blue
		data[(py * image.width * 4) + (px * 4) + 3] = 255; // Alpha
	}
	context.putImageData(image, 0, 0);

	if (py < image.height) {
		setTimeout(createMandelbrot.bind(this, ++py), 1);
	}
}

// Common functions
function setBackground() {
	for (var i = 0; i < data.length; i += 4) {
		data[i] = 229; // red
		data[i + 1] = 75; // green
		data[i + 2] = 75; // blue
		data[i + 3] = 255; // transparency
	}
}

function isClose(c1, c2) {
	var diffReal = c1.re - c2.re;
	var diffImg = c1.im - c2.im;
	if (math.abs(diffReal) < reallySmall && math.abs(diffImg) < reallySmall) {
		return true;
	} else {
		return false;
	}
}

function setupCanvas(targetWidth, targetHeight){
	canvas = document.getElementById('canvas');
	canvas.style.width = targetWidth;
	canvas.style.height = targetHeight;

	context = canvas.getContext('2d');

	width, height;
	width = canvas.getBoundingClientRect().width;
	height = canvas.getBoundingClientRect().height;
	canvas.style.width = "";
	canvas.style.height = "";
	canvas.width = width;
	canvas.height = height;

	aspectRatio = width / height;
	unitHeight = 4;
	unitWidth = aspectRatio * unitHeight;
	image = context.getImageData(0, 0, width, height);
	data = image.data;
}

setupCanvas("100%", "100%");
setBackground();
createMandelbrotWithPeriod();