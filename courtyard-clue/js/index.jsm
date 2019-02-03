import {dial, digit_elements, reveal_message} from './UI.jsm';
import {delay, event_stream, stream_join} from './utilities.jsm';
import {check_passcode, degrees_to_symbol} from './secrets.jsm';

// Since this machine should never be killed, we can use an async function instead of an async generator
async function behavior() {
	do {
		let degrees = 0;
		let last_degrees = degrees;
		let direction;
		for (let digit of digit_elements) {
			const main_el = document.body.querySelector('main');
			let last_touch_y;
			for await (let event of stream_join(
				event_stream(main_el, 'wheel'),
				event_stream(main_el, 'touchmove')
			)) {
				if (event.type == 'touchmove') {
					event.preventDefault();
					event.stopPropagation();
					const Scaler = .5;
					const diff = last_touch_y ? e.touches[0].clientY - last_touch_y : 0;
					last_touch_y = e.touches[0].clientY;
					degrees += diff * Scaler;
				} else if (event.type == 'wheel') {
					const Scaler = .5;
					degrees += e.deltaY * Scaler;
				}
				const new_direction = (last_degrees - dial_degrees < 0) ? 'down' : 'up';
				if (direction && direction !== new_direction) {
					enter_number();
				} else {
					digits[selected_digit].innerText = dial_value;
				}
				direction = new_direction;
				last_degrees = dial_degrees;
			}
		}
	} while (!check_passcode(digit_elements.map(el => el.innerText));

	// Lock cracked - Display secret message
	reveal_message();
}

behavior();
