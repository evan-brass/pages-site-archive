var canvas = document.getElementById('canvas');
canvas.style.width = "900px";
canvas.style.height = "450px";

var context = canvas.getContext('2d');

var width, height;
width = canvas.getBoundingClientRect().width;
height = canvas.getBoundingClientRect().height;
canvas.style.width = "";
canvas.style.height = "";
canvas.width = width;
canvas.height = height;

var aspectRatio = width / height;
var unitHeight = 2;
var unitWidth = aspectRatio * unitHeight;
var image = context.getImageData(0, 0, width, height);
var data = image.data;

function isClose(c1, c2) {
	const
	reallySmall = 0.0000001;

	var diffReal = c1.re - c2.re;
	var diffImg = c1.im - c2.im;
	if (math.abs(diffReal) < reallySmall && math.abs(diffImg) < reallySmall) {
		return true;
	} else {
		return false;
	}
}

function isMandelbrot(c, previousAnswers, tries) {
	previousAnswers = previousAnswers || [];
	tries = tries || 0;

	if (math.abs(c) > 2) {
		return false;
	}

	if (previousAnswers.some(function(item) {
		return _.isEqual(c, item);
	})) {
		return true;
	}

	if (previousAnswers.length > 0
			&& isClose(c, previousAnswers[previousAnswers.length - 1])) {
		return true;
	}

	++tries;
	if (tries > 30) {
		return true;
	}

	previousAnswers.push(c);
	return isMandelbrot(math.add(math.square(c), previousAnswers[0]),
			previousAnswers, tries);

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

function createMandelbrot(py, px) {
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
	
	if(py < image.height){
		setTimeout(createMandelbrot.bind(this, ++py), 10);
	}
}

function makeSolidBlack() {
	for (var i = 0; i < data.length; i += 4) {
		data[i] = 0; // red
		data[i + 1] = 0; // green
		data[i + 2] = 0; // blue
		data[i + 3] = 255; // transparency
	}
}
makeSolidBlack();
createMandelbrot();