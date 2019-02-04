var app = angular.module('WalletApp', []);

app.controller('WalletController', function ($scope, $http, $rootScope) {

	let uiRefreshInterval = 5*1000; // in milliseconds
	$scope.loading = false;
	$scope.Math = window.Math;
	$scope.numeral = window.numeral;
	$scope.moment = moment;
	$scope.transactions = [];

	$scope.load = function () {

		$scope.loading = true;

		$http({
			"url": "/api/home",
			"method": "GET",
			"headers": {
				"token": localStorage.getItem("token")
			}
		}).then(function (response) {

			$scope.state = 'online';

			let data = response.data;

			$scope.balance = data.balance;
			$scope.accounts = data.accounts;
			$scope.staking = data.staking;

			if($scope.transactions.length < 10) {
				$scope.transactions = data.transactions;
			}

			$scope.blockchain = data.blockchain;
			$scope.prices = data.prices;

			$scope.loading = false;
			$scope.lastUpdated = moment();

		}).catch(function(error) {

			showNoty("there was an error fetching data from server...", "alert");
			$scope.state = 'offline';
			$scope.loading = false;

		});

	};

	$scope.enableStaking = function () {

		Swal.fire({
			"text": 'please provide password for staking',
			"input": "password",
			"button": {
				"text": "enable",
				"closeModal": false
			},
			"showCancelButton": true
		}).then(function (result) {

			if ("value" in result) {
				$http({
					"url": "/api/enable-staking",
					"method": "POST",
					"data": {
						"password": result.value
					},
					"headers": {
						"token": localStorage.getItem("token")
					}
				}).then(function (staking) {

					console.log(staking);

					if("error" in staking) {
						Swal.fire("staking", "there was an error", "error");
					} else {
	
						$scope.staking = staking;

						Swal.fire("staking", "should be enabled now.", "success");

					}

				});

			}

		});

	};

	$scope.fillTransactions = function() {

		$scope.loading = true;
		$http({
			"url": "/api/gettransactions/" + $scope.transactions.length,
			"method": "GET",
			"headers": {
				"token": localStorage.getItem("token")
			}
		}).then(function (response) {

			let transactions = response.data;

			console.log('fillTransactions', transactions);
			if(transactions.length) {
				$scope.transactions = $scope.transactions.concat(transactions);
			}

			if(transactions.length < 10) {
				$scope.allTransactionsShown = true;
			}

			$scope.loading = false;

		}).catch(function(error) {
			console.log(error);
			showNoty("there was an error fetching data from server...", "alert");
			$scope.loading = false;
		});

	};

	setInterval(function() {
		$scope.$apply();
	}, uiRefreshInterval);

	$scope.logout = function() {
		localStorage.removeItem('token');
		$rootScope.isAuthenticated = false;
	};

	$rootScope.$watch('isAuthenticated', function() {

		console.log('BLING', $rootScope.isAuthenticated);
		if($rootScope.isAuthenticated === true) {
			$scope.load();
		} else {
			localStorage.removeItem('token');
		}

	});

});

app.controller('AuthenticationController', function($scope, $http, $rootScope) {

	$scope.sendLogin = function() {

		$http({
			"url": "/login",
			"method": "POST",
			"data": {
				"username": $scope.username,
				"password": $scope.password
			}
		}).then(function(response) {

			let result = response.data;

			if(result.authenticated === true) {
				console.log("authed!");
				localStorage.setItem("token", result.token);
				$rootScope.isAuthenticated = true;
			} else {
				throw Error();
			}

		}).catch(function(error) {
			showNoty("there was an error with your credentials...");
		});
		console.log($scope.username);
		console.log($scope.password);
	};

	let token = localStorage.getItem("token");
	if(token) {
		$rootScope.isAuthenticated = true;
	}

});

function showNoty(text, type) {
	new Noty({
		"theme": "mint",
		"text": text,
		"type": type
	}).show();
}

// register service worker
if ('serviceWorker' in navigator) {

	navigator.serviceWorker.register('/worker.js', {
		"scope": "/"
	}).then(function (registration) {
		console.log(registration);
	}).catch(function (error) {
		console.log('Service worker registration failed, error:', error);
	});

}