import {wrong_code, correct_code, clear_code, update_dial, digit_elements, reveal_message} from './UI.mjs';
import {delay, event_stream, stream_join, normalize_degrees} from './utilities.mjs';
import {passcode, symbols} from './secrets.mjs';


function check_passcode(symbols) {
	return symbols.length == passcode.length &&
	symbols.every((item, i) => passcode[i] == item);
}

function degrees_to_symbol(degrees) {
	// Normalize degrees from any number to and integer between [0, 360)
	return symbols[Math.round(normalize_degrees(degrees) * symbols.length / 360) % symbols.length];
}

// Since this machine should never be killed, we can use an async function instead of an async generator
async function behavior() {
	let degrees = 0;
	let last_degrees = degrees;
	let direction;
	while (1) {
		const main_el = document.body.querySelector('main');
		let last_touch_y;
		for (let digit of digit_elements) {
			console.group('filling digit');
			for await (let event of stream_join(
				event_stream(main_el, 'wheel'),
				event_stream(main_el, 'touchmove'),
				event_stream(main_el, 'touchstart'),
				event_stream(main_el, 'touchend')
			)) {
				if (event.type == 'touchmove') {
					event.preventDefault();
					event.stopPropagation();
					const Scaler = .5;
					const diff = last_touch_y ? event.touches[0].clientY - last_touch_y : 0;
					last_touch_y = event.touches[0].clientY;
					degrees += diff * Scaler;
				} else if (event.type == 'wheel') {
					const Scaler = .1;
					degrees += event.deltaY * Scaler;
				} else if (event.type == 'touchend') {
					last_touch_y = undefined;
				}
				console.log('new degrees', degrees);
				if (Math.abs(degrees - last_degrees) > 1) {
					update_dial(degrees);
					const new_direction = (last_degrees - degrees < 0) ? 'down' : 'up';
					if (direction && direction !== new_direction) {
						direction = new_direction;
						last_degrees = degrees;
						console.groupEnd();
						break;
					} else {
						direction = new_direction;
						last_degrees = degrees;
						digit.innerText = degrees_to_symbol(degrees);
					}
				}
			}
		}
		// Check if the passcode is correct
		if (check_passcode(digit_elements.map(el => el.innerText))) {
			break;
		}
		wrong_code();
		await delay(500);
		clear_code();
	}

	// Lock cracked - Display secret message
	correct_code();
	reveal_message();
}

behavior();
