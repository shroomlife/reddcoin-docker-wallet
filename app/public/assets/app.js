var app = angular.module('WalletApp', []);

app.controller('WalletController', function ($scope, $http) {

	let reloadButton = $("#reloadButton");

	$scope.loading = false;
	$scope.Math = window.Math;
	$scope.numeral = window.numeral;
	$scope.moment = moment;
	$scope.transactions = [];

	$scope.load = function () {

		$scope.loading = true;

		$http.get("/api/home").then(function (response) {

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

				$http.post("/api/enable-staking", {
					"password": result.value
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
		$http.get("/api/gettransactions/" + $scope.transactions.length).then(function (response) {

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

	$scope.load();

	setInterval(function() {
		$scope.$apply();
	}, 5000);

});

function showNoty(text, type) {
	new Noty({
		"theme": "mint",
		"text": text,
		"type": type
	}).show();
}