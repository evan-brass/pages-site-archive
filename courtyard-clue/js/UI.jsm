import {symbols, passcode, message} from './secrets.jsm';

export const dial = document.createElement('div');
dial.classList.add('dial');
symbols.forEach((sym, i) => {
	const el = document.createElement('span');
	el.innerText = sym;
	el.style.transform = `translateX(-50%) rotate(${(i-1)*360/symbols.length}deg)`
	dial.appendChild(el);
});
document.body.querySelector('.dial-placeholder').replaceWith(dial);
export function update_dial(degrees) {

}

const digit_holder = document.body.querySelector('.digits');
export const digit_elements = [];
passcode.forEach(_ => {
	const digit = document.createElement('span');
	digit_elements.push(digit);
	digit_holder.appendChild(digit);
});

const message_holder = document.body.querySelector('.secret-message');
export function reveal_message() {
	message_holder.innerText = message;
	message_holder.classList.add('revealed');
}
