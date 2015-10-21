angular.module('starter.controllers', ['starter.directives'])

.controller('DashCtrl', function($scope) {})

.controller('MapCtrl', function($scope, $ionicLoading) {
  $scope.mapCreated = function(map) {
    $scope.map = map;
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };
})

.controller("InterestpointsCtrl", function($scope, $http) {

  var data = {
    buid : 'building_50f56644-9101-42b0-b2d9-49df37fe95db_1445422155408'
  };

  $http.post('http://localhost:8100/anyplace/mapping/pois/all_building', data)
    .then(function(resp) {
      $scope.pois = resp.data.pois.filter(function(item)
      {
        return item.name != 'Connector';
      });
      console.log('Success', resp);
      // For JSON responses, resp.data contains the result
    }, function(err) {
      console.error('ERR', err);
      // err.status will contain the status code
    })

});
