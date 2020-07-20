var app = angular.module('WalletApp', []);

app.controller('WalletController', function ($scope, $http, $rootScope) {

  let uiRefreshInterval = 5*1000; // in milliseconds
  $scope.loading = false;
  $scope.Math = window.Math;
  $scope.numeral = window.numeral;
  $scope.moment = moment;
  $scope.transactions = [];
  $scope.notifications = false;
  $scope.notificationsEnabled = false;

  if("Notification" in window) {
    $scope.notificationsEnabled = true;
    $scope.notifications = Notification.permission === "granted" ? true : false;
  }

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

      logout($rootScope);
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

      if(transactions.length) {
        $scope.transactions = $scope.transactions.concat(transactions);
      }

      if(transactions.length < 10) {
        $scope.allTransactionsShown = true;
      }

      $scope.loading = false;

    }).catch(function(error) {
      console.error("ERROR: ", error);
      showNoty("there was an error fetching data from server...", "alert");
      $scope.loading = false;
    });

  };

  setInterval(function() {
    $scope.$apply();
  }, uiRefreshInterval);

  $scope.logout = function() {
    logout($rootScope);
  };

  $rootScope.$watch('isAuthenticated', function() {

    if($rootScope.isAuthenticated === true) {
      $scope.load();
    } else {
      logout($rootScope);
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
        localStorage.setItem("token", result.token);
        $rootScope.isAuthenticated = true;
      } else {
        throw Error();
      }

    }).catch(function(error) {
      showNoty("there was an error with your credentials...");
    });
  };

  let token = localStorage.getItem("token");
  if(token) {
    $rootScope.isAuthenticated = true;
  }

});

if ('serviceWorker' in navigator && 'PushManager' in window) {

  navigator.serviceWorker.register('/worker.js', {
    "scope": "/"
  }).catch(function (error) {
    console.log('Service worker registration failed, Error:', error);
  });

}

function logout(root) {
  localStorage.removeItem('token');
  root.isAuthenticated = false;
}

function showNoty(text, type) {
  new Noty({
    "theme": "mint",
    "text": text,
    "type": type
  }).show();
}

function getIdFromUrl(endpoint) {
  let index = endpoint.lastIndexOf("/") + 1;
  return endpoint.slice(index);
}