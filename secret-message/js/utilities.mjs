export function delay(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

export function normalize_degrees(degrees) {
	return ((degrees % 360) + 360) % 360;
}

function create_differed() {
	const ret = new Promise((resolve, reject) => {
		ret.resolve = resolve;
		ret.reject = reject;
	});
	console.trace('Created a differed', ret);
	return ret;
}

export function shuffle(array) {
	// Simple in place shuffle
	for (let i = array.length - 1; i >= 0; --i) {
		const swap_index = Math.floor(Math.random() * i + 1); // [0, i] allows for an item to stay in the same position
		const temp = array[swap_index];
		array[swap_index] = array[i];
		array[i] = temp;
	}
	return array;
}

export async function* event_stream(target, event) {
	let resolve_callback = () => {};
	const handler = e => {
		resolve_callback(e);
	};
	try {
		target.addEventListener(event, handler);
		while (1) {
			yield await new Promise(resolve => resolve_callback = resolve);
		}
	} finally {
		target.removeEventListener(event, handler);
	}
}

export async function* stream_join(...streams) {
	let alive_streams = streams.length;
	const return_values = [];
	const never_resolves = new Promise(() => {});
	const promises = Array.from(streams).map((stream, i) => {
		const handler = value => {
			if (!value.done) {
				promises[i] = stream.next().then(handler);
				return value.value;
			} else {
				promises[i] = never_resolves;
				--alive_streams;
				return_values[i] = value.value;
			}
		};
		return stream.next().then(handler);
	});
	while (alive_streams) {
		yield await Promise.race(promises);
	}
	return return_values;
}
