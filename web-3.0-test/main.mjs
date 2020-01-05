import Peer from './peer.mjs';
import { toUrlBase64 } from './common.mjs';
import { add_key, get_keys } from './peersistence.mjs';
import { make_jwt } from './push.mjs';

(async function(){
	const title = document.getElementById('title');
	const description = document.getElementById('description');
	const action = document.getElementById('action');

	function do_step(t, d, action_name) {
		title.innerText = t;
		description.innerText = d;
		action.innerText = action_name;
		return {
			then(action_function) {
				action.onclick = action_function;
			}
		};
	}
	
	const registration = await navigator.serviceWorker.register('service-worker.mjs');
	console.log(registration);

	let subscription = false;
	let application_server_key = false;
	if (subscription = await registration.pushManager.getSubscription()) {
		console.log('Existing subscription.  Checking if the application server key is stored in peersistence... ');
		let found_key = false;
		const target_public = new Uint8Array(subscription.options.applicationServerKey);
		for (const key of await get_keys()) {
			const raw_public = new Uint8Array(await crypto.subtle.exportKey('raw', key.publicKey));
			if (target_public.every((v, i) => v == raw_public[i])) {
				found_key = true;
				application_server_key = key;
			}
		}
		if (!found_key) {
			console.log("Couldn't find the key for the existing subscription so unsubscribing: ", await subscription.unsubscribe());
			subscription = false;
		} else {
			console.log("Key was found.")
		}
	}
	if (!subscription) {
		// Create a new subscription

		// Give out to nodes that we want to send us push messages.
		application_server_key = await crypto.subtle.generateKey(
			{	name: 'ECDSA',
				namedCurve: 'P-256'
			},
			false,
			['sign', 'verify']
		);
		console.log(
			'Created new application server key',
			application_server_key
		);
		const server_key = await crypto.subtle.exportKey("raw", application_server_key.publicKey);
		
		// Enabling notifications requires user action so I'm using a button press
		await do_step(
			"Notifications -", 
			"Click the button and then allow notification access.", 
			"Ask me"
		);

		subscription = await registration.pushManager.subscribe({
			// Chrome doesn't allow non-user-visible pushes so we need to show a notification every time.
			userVisibleOnly: true, // TODO: Switch this to be off because we mostly won't want to show notifications.
			applicationServerKey: server_key
		});
		console.log(subscription);

		if (subscription) {
			console.log('Subscribed. Adding key to peersistence...');
			await add_key(application_server_key);
			console.log('Key added.');
		} else {
			console.error('Unable to subscribe?');
		}
	}
	/*
	
	// Encrypt a message to our subscription:
	// Used to encrypt messages to other nodes.
	const push_encrypt_key = await crypto.subtle.generateKey(
		{	name: 'ECDH',
			namedCurve: 'P-256'
		},
		false,
		['deriveKey']
	);
	console.log(
		push_encrypt_key
	);

	// Get the shared key material from the Diffie Helman keys:
	const shared_secret = await crypto.subtle.deriveKey(
		{	name: "ECDH",
			public: await crypto.subtle.importKey(
				'raw', 
				subscription.getKey('p256dh'), 
				{	name: 'ECDH',
					namedCurve: 'P-256'
				},
				false,
				[]
			)
		},
		push_encrypt_key.privateKey,
		{ name: "HKDF" },
		false,
		['deriveBits']
	);
	console.log(
		shared_secret
	);
	
	// Text encoder that we can reuse for a few of the next steps:
	const encoder = new TextEncoder();

	// Construct the info array for the next step:
	// TODO: Looks like there is supposed to be some lengths in here?: https://developers.google.com/web/updates/2016/03/web-push-encryption#deriving_the_encryption_parameters
	// "WebPush: info" || 0x00 || user_agent_public || application_server_public
	const info_header = encoder.encode("WebPush: info");
	const ua_public = new Uint8Array(subscription.getKey('p256dh'));
	const as_public = new Uint8Array(await crypto.subtle.exportKey("raw", push_encrypt_key.publicKey));
	let info = new Uint8Array(info_header.byteLength + 1 + ua_public.byteLength + as_public.byteLength);
	info.set(info_header, 0);
	info.set(ua_public, info_header.byteLength + 1);
	info.set(as_public, info_header.byteLength + 1 + ua_public.byteLength);

	// Shared Secret + Authentication Secret + ("WebPush: info" || 0x00 || user_agent_public || application_server_public)
	const IKM = await crypto.subtle.importKey(
		"raw", 
		await crypto.subtle.deriveBits(
			{	name: "HKDF",
				hash: "SHA-256",
				salt: subscription.getKey('auth'),
				info
			},
			shared_secret,
			256
		),
		{ name: "HKDF" },
		false,
		["deriveBits"]
	);
	console.log(
		IKM
	);

	// Build a random salt:
	const salt = crypto.getRandomValues(new Uint8Array(16));
	console.log(
		salt, 
		toUrlBase64(salt)
	);

	// Construct the info for the encryption key: ("Content-Encoding: aes128gcm" || 0x00)
	const encryption_header = encoder.encode("Content-Encoding: aes128gcm");
	info = new Uint8Array(encryption_header.byteLength + 1);
	info.set(encryption_header, 0);
	
	// Finally, build the encryption key:
	const PKM = await crypto.subtle.importKey(
		"raw", 
		await crypto.subtle.deriveBits(
			{	name: "HKDF",
				hash: "SHA-256",
				salt,
				info
			},
			IKM,
			128
		),
		{ name: "AES-GCM" },
		false,
		["encrypt"]
	);
	console.log(
		PKM
	);
	
	// Construct the info for the nonce: ("Content-Encoding: nonce" || 0x00)
	const nonce_head = encoder.encode("Content-Encoding: nonce");
	info = new Uint8Array(nonce_head.byteLength + 1);
	info.set(nonce_head, 0);

	// And the nonce:
	const nonce = await crypto.subtle.deriveBits(
		{	name: "HKDF",
			hash: "SHA-256",
			salt,
			info
		},
		IKM,
		96
	);
	console.log(
		nonce, 
		toUrlBase64(nonce)
	);

	// Data:
	const max_plaintext = 3992;
	const message = encoder.encode(JSON.stringify({
		prop1: "This is a test",
		prop2: "Hello World",
		prop3: new Date()
	}));
	const padding_len = max_plaintext - message.byteLength;
	if (message.byteLength > max_plaintext) {
		throw new Error("Plaintext too big");
	}
	const data = new Uint8Array(max_plaintext + 2);
	const padding_view = new DataView(data.buffer, 0, 2);
	data.set(message, padding_len + 2);
	padding_view.setInt16(0, padding_len, false);

	// Encrypt the message:
	const cipher_text = await crypto.subtle.encrypt(
		{	name: "AES-GCM",
			iv: nonce
		},
		PKM,
		data
	);
	console.log(cipher_text);
	*/
})();