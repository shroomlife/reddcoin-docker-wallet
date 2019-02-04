self.addEventListener('install', function () {
	console.log("INSTALL EVENT");
	caches.delete("reddwatch").then(function () {
		caches.open("reddwatch").then(function (cache) {
			cache.add("/favicon.ico");
		});
	});
});

self.addEventListener('push', function (event) {

	console.log('Received a push message', event);

	var title = 'Yay a message.';
	var body = 'We have received a push message.';
	var icon = '/images/icon-192x192.png';
	var tag = 'simple-push-demo-notification-tag';

	event.waitUntil(
		self.registration.showNotification(title, {
			body: body,
			icon: icon,
			tag: tag
		})
	);
	
});