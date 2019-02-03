let dial;
let digits = [];
let dial_degrees = 0;
let digit_holder;
const passcode = [2, 4, 3, 5];
const NumbersOnDial = 10;

const wheel_handler = e => {
	const Scaler = .5;
	dial_degrees += e.deltaY * Scaler;
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

const secret_message_holder = document.body.querySelector('.secret-message');

const secret_message = `
	My partner has what you need next<br>
	& they're lying in wait<br>
	where a stadium of rest is found -<br>
	& noise.<br>
	Cue the competition
`;

function delay(ms) {
	return new Promise((resolve, reject) => setTimout(resolve, ms));
}

function create_dial() {
	dial = document.createElement('div');
	dial.classList.add('dial');
	for (let i = 1; i <= NumbersOnDial; ++i) {
		const number = document.createElement('span');
		number.innerText = i;
		number.style.transform = `translateX(-50%) rotateZ(${(i-1)*360/NumbersOnDial}deg)`
		dial.appendChild(number);
	}
	document.body.querySelector('.dial-placeholder').replaceWith(dial);

	digit_holder = document.body.querySelector('.digits');
	passcode.forEach(_ => {
		const digit = document.createElement('span');
		digits.push(digit);
		digit_holder.appendChild(digit);
	})
}

create_dial();
register_handlers();

let selected_digit = 0;
let last_degrees = dial_degrees;
let direction;
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
function reveal_message() {
	secret_message_holder.innerText = secret_message;
	secret_message_holder.classList.add('revealed');
}
