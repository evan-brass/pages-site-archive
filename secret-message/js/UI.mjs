import {pattern, symbols, passcode, message} from './secrets.mjs';
import {normalize_degrees} from './utilities.mjs';

export const dial = document.createElement('div');
dial.classList.add('dial');
symbols.forEach((sym, i) => {
	const el = document.createElement('span');
	el.innerText = sym;
	el.style.transform = `translateX(-50%) rotate(${(i)*360/symbols.length}deg)`
	dial.appendChild(el);
});
document.body.querySelector('.dial-placeholder').replaceWith(dial);
export function update_dial(degrees) {
	dial.style.transform = `rotate(-${normalize_degrees(degrees)}deg)`;
}

const digit_holder = document.body.querySelector('.digits');
export const digit_elements = [];
pattern.forEach(item => {
	const digit = document.createElement('span');
	if (!item) { // Filled by the passcode
		digit_elements.push(digit);
	} else {
		digit.innerText = item;
		digit.classList.add('static');
	}
	digit_holder.appendChild(digit);
});

const message_holder = document.body.querySelector('.secret-message');
export function reveal_message() {
	message_holder.innerText = message;
	message_holder.classList.add('revealed');
}

export function wrong_code() {
	digit_holder.classList.add('wrong');
}
export function correct_code() {
	digit_holder.classList.add('correct');
}
export function clear_code() {
	digit_holder.classList.remove('correct', 'wrong');
	digit_elements.forEach(el => el.innerText = '');
}
