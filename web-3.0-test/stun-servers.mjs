const stun_servers = [
	'stun2.l.google.com:19302',
	'stun3.l.google.com:19302',
	'stun4.l.google.com:19302',
	'stunserver.org:3478'
].map(origin => ({urls: 'stun:' + origin}));

export default stun_servers;