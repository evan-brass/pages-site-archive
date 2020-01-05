function wrap_request(request, handlers) {
	return new Promise((resolve, reject) => {
		for (const key in handlers) {
			request.addEventListener(key, handlers[key]);
		}
		request.addEventListener('success', ({target}) => resolve(target));
		request.addEventListener('error', reject);
	});
}

// Open the peersistence database:
const database = wrap_request(indexedDB.open('peersistence', 1), {
	upgradeneeded: ({target, oldVersion}) => {
		const db = target.result;
		if (oldVersion == 0) {
			// This is where we'll store our peers
			db.createObjectStore('peers', { keyPath: 'id', autoIncrement: true });
		}
	}
}).then(target => target.result);
database.then(db => db.addEventListener('error', console.error));

/**
 * { id, url, public_key, auth_secret, jwt or application_pair }
 * There's no need to store information for nodes who we have been introduced to.  We would have to be reintroduced to be able to connect anyway.  Once the relationship is established and we get their subscription info then there will be something to persist.
 * TODO: Add a human readable name to differentiate the peers
 */
export default class Peer {
	static async find_self(subscription) {
		const db = await database;
		let transaction = db.transaction(['peers'], 'readonly');
		let request = transaction.objectStore('peers').openCursor();
		let cursor = (await wrap_request(request)).result;
		while (cursor) {
			keys.push(cursor.value);
			cursor.continue();
			cursor = (await wrap_request(request)).result;
		}
	}
	static from_db(data) {
		let ret = new Peer();
		ret.add_subscription(data.url, data.auth, )
	}
	add_subscription(push_url, authentication_secret, public_key, jwtOrKeypair) {
		this.url = push_url;
		this.auth = authentication_secret;
		this.public_key = public_key;
		if (jwtOrKeypair instanceof String) {
			// It's a jwt
			this.jwt = jwtOrKeypair;
		} else if (jwtOrKeypair instanceof CryptoKeyPair) {
			// It's an application server key
			this.as_pair = jwtOrKeypair;
		}
		database.then(db => wrap_request(db.transaction('peers', 'readwrite')))
			.then(({result}) => {
				let store = result.objectStore('peers');
				return wrap_result(store.put(this))
			})
			.then(console.log);
	}
	constructor() {}
}