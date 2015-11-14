if('serviceWorker' in navigator){
	console.log('Looks like we can create our service worker.');
	navigator.serviceWorker.register('/ServiceWorkerTest/js/sw.js', {scope: '/ServiceWorkerTest/*'});
} else {
	console.log('doesn\'t look like we can create our service worker.');
}
