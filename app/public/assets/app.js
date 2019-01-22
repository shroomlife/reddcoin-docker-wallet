var app = angular.module('WalletApp', []);

app.controller('WalletController', function($scope, $http) {

	let balance = 0;

	$http.get("/api/ping").then(function() {
		$scope.color = "green";
		$scope.state = 'online';
	}).catch(function() {
		$scope.color = "red";
		$scope.state = 'offline';
	});

	$http.get("/api/getbalance").then(function(response) {
		console.log(response.data);
		$scope.balance = response.data.balance;
	});

	$http.get("/api/listaccounts").then(function(response) {
		console.log(response.data);
		$scope.accounts = response.data.accounts;
	});

	$http.get("/api/listtransactions").then(function(response) {
		console.log(response.data);
		$scope.transactions = response.data.transactions;
	});

	$http.get("/api/getstakinginfo").then(function(response) {
		console.log(response.data);

		if(response.data.staking.staking) {
			response.data.staking.expectedtime = moment().add(response.data.staking.expectedtime * 1000).fromNow();
		}

		$scope.staking = response.data.staking;

	});

});

function showNoty(text) {
	new Noty({
		"text": text,
	}).show();
}