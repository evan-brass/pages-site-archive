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
	// Give out to nodes that we want to send us push messages.
	const push_authentication_key = await crypto.subtle.generateKey({
			name: 'ECDSA',
			namedCurve: 'P-256'
		},
		true,
		['sign', 'verify']
	);
	console.log(push_authentication_key);

	// Used to encrypt messages to other nodes.
	const push_encrypt_key = await crypto.subtle.generateKey({
			name: 'ECDH',
			namedCurve: 'P-256'
		},
		false,
		['deriveKey']
	);
	console.log([push_encrypt_key]);

	const registration = await navigator.serviceWorker.register('service-worker.mjs');
	console.log(registration);

	await do_step(
		"Notifications -", 
		"Click the button and then allow notification access.", 
		"Ask me"
	);
	const server_key = await crypto.subtle.exportKey("raw", push_authentication_key.publicKey);
	console.log(server_key);
	
	let subscription;
	if (subscription = await registration.pushManager.getSubscription()) {
		console.log('Existing subscription.  Unsubscribing: ', await subscription.unsubscribe());
	}
	subscription = await registration.pushManager.subscribe({
		// Chrome doesn't allow non-user-visible pushes so we need to show a notification every time.
		userVisibleOnly: true, // TODO: Switch this to be off because we mostly won't want to show notifications.
		applicationServerKey: server_key
	});
	console.log(subscription);
	const auth_token = subscription.getKey('auth');
	const our_key = await crypto.subtle.importKey(
		'raw', 
		subscription.getKey('p256dh'), 
		{
			name: 'ECDH',
			namedCurve: 'P-256'
		},
		true,
		[]
	);
	console.log(auth_token, our_key);

})();