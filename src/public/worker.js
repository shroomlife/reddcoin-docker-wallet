self.addEventListener('install', function () {
	caches.delete("reddcoin-docker-wallet").then(function () {
		caches.open("reddcoin-docker-wallet").then(function (cache) {
			cache.add("/favicon.ico");
		});
	});
});
