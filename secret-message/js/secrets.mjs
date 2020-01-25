import {shuffle} from './utilities.mjs';

export const symbols = shuffle(
	Array.from(new Set("EatMorChikin"))
);
export const passcode = "EatMorChikin".split('');
export const pattern = ['🍽️', 0,0,0, '⬆️', 0, 0, 0, '🐔', 0, 0, 0, 0, 0, 0];
export const message = `
	A message frum yor naybur hood cow.
`;
