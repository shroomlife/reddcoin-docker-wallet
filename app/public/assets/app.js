var app = angular.module('WalletApp', []);

app.controller('WalletController', function($scope, $http) {

	$scope.Math = window.Math;

	$scope.ping = function() {

		$http.get("/api/ping").then(function() {
			$scope.color = "green";
			$scope.state = 'online';
		}).catch(function() {
			$scope.color = "red";
			$scope.state = 'offline';
		});

	}

	$scope.reload = function() {

		console.log('starting to reload!!!');

		$http.get("/api/home").then(function(response) {

			let data = response.data;

			if(response.data.staking.staking) {
				response.data.staking.expectedtime = moment().add(response.data.staking.expectedtime * 1000).fromNow();
			}
			
			$scope.balance = data.balance;
			$scope.accounts = data.accounts;
			$scope.staking = data.staking;
			$scope.transactions = data.transactions;
			$scope.blockchain = data.blockchain;

		});

	}

	$scope.ping();
	$scope.reload();

});

function showNoty(text) {
	new Noty({
		"text": text,
	}).show();
}