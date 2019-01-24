var app = angular.module('WalletApp', []);

app.controller('WalletController', function ($scope, $http) {

	let reloadButton = $("#reloadButton");

	$scope.Math = window.Math;
	$scope.moment = moment;

	$scope.ping = function () {

		$http.get("/api/ping").then(function () {
			$scope.color = "green";
			$scope.state = 'online';
		}).catch(function () {
			$scope.color = "red";
			$scope.state = 'offline';
		});

	};

	$scope.reload = function () {

		reloadButton.attr("disabled", true);

		$http.get("/api/home").then(function (response) {

			let data = response.data;

			$scope.balance = data.balance;
			$scope.accounts = data.accounts;
			$scope.staking = data.staking;
			$scope.transactions = data.transactions;
			$scope.blockchain = data.blockchain;

			reloadButton.attr("disabled", false);

		}).catch(function() {
			reloadButton.attr("disabled", false);
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

			} else {
				Swal.fire("staking", "you need to enter a password ...", "error");
			}

		});

	};

	$scope.ping();
	$scope.reload();

});

function showNoty(text) {
	new Noty({
		"text": text,
	}).show();
}