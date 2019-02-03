export function delay(ms) {
	return new Promise((resolve, reject) => setTimout(resolve, ms));
}

function create_differed() {
	const ret = new Promise((resolve, reject) => {
		ret.resolve = resolve;
		ret.reject = reject;
	});
	console.trace('Created a differed', ret);
	return ret;
}

export async function* event_stream(target, event) {
	let resolve_callback = () => {};
	const handler = e => {
		resolve_callback(e);
	};
	try {
		target.addEventListener(event, handler);
		while (1) {
			yield new Promise(resolve => resolve_callback = resolve);
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
				return value;
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
