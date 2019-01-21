var app = angular.module('WalletApp', []);

app.controller('WalletController', function($scope, $http) {

	let loader = [];
	let balance = 0;

	let pingLoad = $http.get("/api/ping").then(function() {
		$scope.color = "green";
		$scope.state = 'online';



	}).catch(function() {
		$scope.color = "red";
		$scope.state = 'offline';
	});

	let balanceLoad = $http.get("/api/getbalance").then(function(response) {
		console.log(response.data);
		$scope.balance = response.data.balance;
	});

	let accountsLoad = $http.get("/api/listaccounts").then(function(response) {
		console.log(response.data);
		$scope.accounts = response.data.accounts;
	});

	let stakingLoad = $http.get("/api/getstakinginfo").then(function(response) {
		console.log(response.data);

		if(response.data.staking.staking) {
			response.data.staking.expectedtime = moment().add(response.data.staking.expectedtime * 1000).fromNow();
		}

		$scope.staking = response.data.staking;

	});

	loader.push(pingLoad, balanceLoad, accountsLoad);

	Promise.all(loader).then(() => {
		$('#loader').fadeOut(150);
	});



});

function showNoty(text) {
	new Noty({
		"text": text,
	}).show();
}