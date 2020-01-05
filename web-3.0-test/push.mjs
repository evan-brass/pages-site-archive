import { strToArray } from './common.mjs';

// By default this makes a jwt that is valid for 23 hours
export async function make_jwt(
	signing_key, 
	duration = (23 /*hr*/ * 60 /*min*/ * 60/*sec*/ * 1000/*ms*/),
	audience = "https://evan-brass.github.io/web-3.0-test",
	subscriber = "mailto:evan-brass@protonmail.com"
) {
	// Create a JWT that pushers to our subscription will need
	const jwt_header = toUrlBase64(JSON.stringify({
		typ: "JWT",
		alg: "ES256"
	}));
	const experation_stamp = Date.now() + duration;
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