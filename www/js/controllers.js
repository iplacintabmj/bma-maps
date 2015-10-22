angular.module('starter.controllers', ['starter.directives'])

.controller('DashCtrl', function($scope) {})

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading) {

  var markers = [];

  $scope.mapCreated = function(map) {
    $scope.map = map;
    $scope.map.setZoom(2);
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
      $scope.map.setZoom(17);
      $ionicLoading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };

  $rootScope.$on('loadPoi', function(event, poi) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }

        $scope.map.setCenter(new google.maps.LatLng(poi.coordinates_lat, poi.coordinates_lon));
        $scope.map.setZoom(19);

        var myLatLng = {lat: +poi.coordinates_lat, lng: +poi.coordinates_lon};

        var marker = new google.maps.Marker({
          position: myLatLng,
          map: $scope.map,
          title: poi.name
        });
        markers.push(marker);
    });
})

.controller("InterestpointsCtrl", function($rootScope, $scope, $http, $ionicModal, $ionicFilterBar, $location) {
  var filterBarInstance;

  $scope.listCanSwipe = true;

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
    });

  $ionicModal.fromTemplateUrl('picture-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(poi) {
    console.log('Showing picture for POI', poi);
    $scope.currentPoi = poi;
    $scope.imageUrl = 'http://localhost:8100/images/' + poi.puid + ".jpg";
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.showFilterBar = function () {
      filterBarInstance = $ionicFilterBar.show({
        items: $scope.pois,
        update: function (filteredItems) {
          $scope.pois = filteredItems;
        },
        filterProperties: 'name'
      });
    };

  $scope.showInMap = function (poi) {
      console.log('Calling map with coordinates ' + poi.coordinates_lat + ":" + poi.coordinates_lon);
      $rootScope.$broadcast('loadPoi', poi);
      $location.path("tab/map");
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

});
