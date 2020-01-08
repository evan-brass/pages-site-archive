import { strToArray, arrayToStr, toUrlBase64 } from './common.mjs';

// By default this makes a jwt that is valid for 12 hours
export async function make_jwt(
	signing_key, 
	audience,
	duration = (12 /*hr*/ * 60 /*min*/ * 60/*sec*/),
	subscriber = "mailto:evan-brass@protonmail.com"
) {
	// Create a JWT that pushers to our subscription will need
	const jwt_header = toUrlBase64(JSON.stringify({
		typ: "JWT",
		alg: "ES256"
	}));
	const experation_stamp = Math.round((Date.now() / 1000) + duration);
	const jwt_body = toUrlBase64(JSON.stringify({
		aud: audience,
		exp: experation_stamp,
		sub: subscriber
	}));
	const signature = toUrlBase64(arrayToStr(await crypto.subtle.sign({
			name: "ECDSA",
			hash: "SHA-256"
		},
		signing_key,
		strToArray(jwt_header + "." + jwt_body)
	)));
	const jwt = jwt_header + '.' + jwt_body + '.' + signature;
	return jwt;
}
export async function make_info(type, client_public, server_public) {
	const encoder = new TextEncoder();

	const client_raw = new Uint8Array(await crypto.subtle.exportKey('raw', client_public));
	const client_len = new Uint8Array(2);
	new DataView(client_len.buffer).setUint16(0, client_raw.byteLength, false);

	const server_raw = new Uint8Array(await crypto.subtle.exportKey('raw', server_public));
	const server_len = new Uint8Array(2);
	new DataView(server_len.buffer).setUint16(0, client_raw.byteLength, false);

	const template = [
		new Uint8Array(encoder.encode("Content-Encoding: ")),
		new Uint8Array(encoder.encode(type)),
		1, // Null byte.  Uint8Array is initialized to all 0 so we just skip the byte
		new Uint8Array(encoder.encode('P-256')),
		1, // Null byte.
		client_len,
		client_raw,
		server_len,
		server_raw
	];
	const total = template.reduce((acc, item) => 
		acc + (Number.isInteger(item) ? item : item.byteLength),
	0);
	const info = new Uint8Array(total);
	let offset = 0;
	for (const item of template) {
		if (!Number.isInteger(item)) {
			info.set(item, offset);
			offset += item.byteLength;
		} else {
			offset += item;
		}
	}
	return info;
}