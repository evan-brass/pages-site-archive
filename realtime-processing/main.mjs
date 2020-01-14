(async function initialize() {
	const canvas = document.createElement('canvas');

	// Make the canvas centered
	if (canvas.attributeStyleMap) {
		canvas.attributeStyleMap.set('max-width', CSS.percent(100));
		canvas.attributeStyleMap.set('position', 'absolute');
		canvas.attributeStyleMap.set('left', CSS.percent(50));
		canvas.attributeStyleMap.set('top', CSS.percent(50));
		canvas.attributeStyleMap.set('transform', new CSSTransformValue([
			new CSSTranslate(CSS.percent(-50), CSS.percent(-50))
		]));
	} else {
		canvas.style.maxWidth = '100%';
		canvas.style.position = 'absolute';
		canvas.style.left = '50%';
		canvas.style.top = '50%';
		canvas.style.transform = 'translate(-50%, -50%)';
	}
	document.body.appendChild(canvas);
	console.log('Built canvas');

	// Make the user click a button so that the media request  happens in response to a user action
	const user_input_button = document.createElement('button');
	user_input_button.innerText = "Click me to open webcam access";
	document.body.appendChild(user_input_button);
	await new Promise(res => user_input_button.onclick = () => {
		user_input_button.remove();
		res();
	});

	// Get access to the user's camera
	let stream;
	try {
		stream = await navigator.mediaDevices.getUserMedia({ video: {
				maxWidth: 1080,
				maxHeight: 720
			}
		 });
	} catch (err) {
		console.error("Unable to get the user's video stream.");
		throw err;
	}
	console.log('Aquired webcam stream');

	// Turn the camera into a video that we can render and 
	let video;
	{
		video = document.createElement('video');
		let loaded = new Promise((resolve, reject) => {
			video.onloadedmetadata = resolve;
		});
		video.srcObject = stream;
		await loaded;
		video.play();
	}
	console.log('Started playing webcam in video element');

	// Transfer the aspect ratio and width/height of the stream to the canvas
	{
		let settings = stream.getVideoTracks()[0].getSettings();
		video.width = settings.width;
		video.height = settings.height;
		let screenAspect = window.innerWidth / window.innerHeight;
		if (settings.aspectRatio > screenAspect) {
			if (canvas.attributeStyleMap) {
				canvas.attributeStyleMap.set('width', CSS.percent(100));
			} else {
				canvas.style.width = '100%';
			}
		} else {
			if (canvas.attributeStyleMap) {
				canvas.attributeStyleMap.set('height', CSS.percent(100));
			} else {
				canvas.style.height = '100%';
			}
		}
		canvas.width = video.width;
		canvas.height = video.height;
	}
	console.log('Transferred webcam properties to canvas');

	// Canvas Drawing
	const context = canvas.getContext('2d');

	// nextFrame
	let buffer;
	if (window.OffscreenCanvas !== undefined) {
		buffer = new OffscreenCanvas(canvas.width, canvas.height);
		console.log('Created background canvas: type = offscreen');
	} else {
		buffer = document.createElement('canvas');
		buffer.width = canvas.width;
		buffer.height = canvas.height;
		console.log('created background canvas: type = element');
	}
	const drawContext = buffer.getContext('2d');

	// Worker Pool
	const workerPool = new class WorkerPool {
		constructor(workerCount = 2, source = 'filters.mjs') {
			this.workers = [];
			for (let i = 0; i < workerCount; ++i) {
				const worker = new Worker(source, {
					type: 'module',
					name: `${source} - ${i}`
				});
				worker.onmessage = ({data}) => {
					if (data == 'ready') {
						worker.onmessage = null;
						this.returnWorker(worker);
					}
				};
			}
			this.workers.then = func => {
				if (this.workers.length > 0) {
					func();
				} else {
					this.workers.waiting = func;
				}
			};
			this.getWorker = this._getWorker();
		}
		async *_getWorker() {
			while (true) {
				await this.workers;
				yield this.workers.pop();
			}
		}
		returnWorker(worker) {
			this.workers.push(worker);
			if (this.workers.waiting) {
				this.workers.waiting();
				this.workers.waiting = false;
			}
		}
	};
	console.log('Created worker pool');

	const linesPerSwatch = 60;
	function* createSwatches() {
		for (let y = 0; y < buffer.height; y += linesPerSwatch) {
			let data = drawContext.getImageData(0, y, buffer.width, linesPerSwatch);
			yield [data, y];
		}
	}
	function putSwatch(swatch, y) {
		drawContext.putImageData(swatch, 0, y);
	}

	// Kick start the draw loop
	console.log('About to bootstrap draw loop');
	(async function draw() {
		// Pull an image from the camera
		drawContext.drawImage(video, 0, 0);

		let before = performance.now();
		await Promise.all((function* () {
			for (let [swatch, y] of createSwatches()) {
				yield (async function () {
					const worker = (await workerPool.getWorker.next()).value;
					const received = new Promise(resolve => {
						worker.onmessage = e => {
							// console.log(`Received swatch: y=${y} worker=`, worker);
							const responseData = e.data;
							workerPool.returnWorker(worker);
							putSwatch(responseData, y);
							resolve();
						};
					});
					// console.log(`Sending swatch: y=${y} worker=`, worker);
					worker.postMessage(swatch, [swatch.data.buffer]);
					await received;
				})();
			}
		})());
		// console.log('Durration to render a frame:', performance.now() - before);

		// Push the drawn image to the displayed canvas.
		await new Promise((resolve, reject) => {
			requestAnimationFrame(() => {
				context.drawImage(buffer, 0, 0);
				resolve();
			});
		});

		// Repeat
		draw();
	})();
})();
