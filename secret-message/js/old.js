let dial;
let digits = [];
let dial_degrees = 0;
let digit_holder;

const wheel_handler = e => {

	update_digit();
}
let last_touch_y;
const touchmove_handler = e => {
	e.preventDefault();
	e.stopPropagation();
	const Scaler = .5;
	const diff = last_touch_y ? e.touches[0].clientY - last_touch_y : 0;
	last_touch_y = e.touches[0].clientY;
	dial_degrees += diff * Scaler;
	update_digit();
};
const touchstart_handler = e => {
	e.preventDefault();
	e.stopPropagation();
	last_touch_y = false;
};


create_dial();
register_handlers();

let selected_digit = 0;
function enter_number() {
	if (++selected_digit == passcode.length) {
		if (digits.every((el, i) => el.innerText == passcode[i])) {
			digit_holder.classList.add('correct');
			document.body.querySelector('main').classList.add('cracked');
			unregister_handlers();
			reveal_message();
		} else {
			digits.forEach(el => el.innerText = '');
			selected_digit = 0;
			digit_holder.classList.add('wrong');
		}
	}
}
function update_digit() {
	if (Math.abs(dial_degrees - last_degrees) >= 1) {
		digit_holder.classList.remove('wrong');
		const math_degrees = ((dial_degrees % 360) + 360) % 360;
		dial.style.transform = `rotate(-${math_degrees}deg)`;
		const dial_value = Math.round(NumbersOnDial * math_degrees / 360) % NumbersOnDial + 1;
		if (selected_digit == passcode.length - 1) {
			if (dial_value == passcode[selected_digit]) {
				digits[selected_digit].innerText = dial_value;
				enter_number();
			}
		}
		const new_direction = (last_degrees - dial_degrees < 0) ? 'down' : 'up';
		if (direction && direction !== new_direction) {
			enter_number();
		} else {
			digits[selected_digit].innerText = dial_value;
		}
		direction = new_direction;
		last_degrees = dial_degrees;
		console.log(dial_degrees);
	}
}
function register_handlers() {
	document.body.querySelector('main').addEventListener('wheel', wheel_handler);
	document.body.querySelector('main').addEventListener('touchmove', touchmove_handler);
	document.body.querySelector('main').addEventListener('touchstart', touchstart_handler);
}
function unregister_handlers() {
	document.body.querySelector('main').removeEventListener('wheel', wheel_handler);
	document.body.querySelector('main').removeEventListener('touchmove', touchmove_handler);
	document.body.querySelector('main').removeEventListener('touchstart', touchstart_handler);
}
