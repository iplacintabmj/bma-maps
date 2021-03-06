angular.module('starter.controllers', ['starter.directives'])

.controller('DashCtrl', function($scope) {})

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $http) {

  var markers = [];

  $scope.mapCreated = function(map) {
    $scope.map = map;
    $scope.map.setZoom(2);
  };

  $scope.centerOnMe = function () {

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

      var image = 'img/flag.png';

      var marker = new google.maps.Marker({
        position: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        animation: google.maps.Animation.DROP,
        map: $scope.map,
        icon: image
      });

      markers.push(marker);

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

        var infowindow = new google.maps.InfoWindow();
        
        marker.content = poi.name;

        google.maps.event.addListener(marker, 'click', (function(marker, poi, infowindow) {
          return function() {
            infowindow.setContent(this.content);
            infowindow.open($scope.map, this);
          };
        })(marker, poi, infowindow));

        google.maps.event.trigger(marker, 'click');
    });

  $scope.setMarkers = function() {

  	$scope.centerOnMe();

  	var data = {
  		buid : 'building_50f56644-9101-42b0-b2d9-49df37fe95db_1445422155408'
  	};
  	var infowindow = new google.maps.InfoWindow();

  	$http.post('http://localhost:8100/anyplace/mapping/pois/all_building', data)
      .then(function(resp) {
        var pois = resp.data.pois.filter(function(item)
        {
          return item.name != 'Connector';
        });


    	  for (poi in pois)
    	  {
      		var marker = new google.maps.Marker({
      			position: {lat: parseFloat(pois[poi].coordinates_lat), lng: parseFloat(pois[poi].coordinates_lon)},
      			map: $scope.map
      		});

          markers.push(marker);

      		marker.content = pois[poi].name;

      		google.maps.event.addListener(marker, 'click', (function(marker, poi, infowindow) {
        		return function() {
        			infowindow.setContent(this.content);
        			infowindow.open($scope.map, this);
        		};
      		})(marker, poi, infowindow));

  	  }
        // For JSON responses, resp.data contains the result
      }, function(err) {
        console.error('ERR', err);
        // err.status will contain the status code
      });
    }
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

  $ionicModal.fromTemplateUrl('toilet-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.toiletModal = modal;
  });

  $scope.openModal = function(poi) {
    console.log('Showing picture for POI', poi);
    $scope.currentPoi = poi;
    $scope.imageUrl = 'http://localhost:8100/images/' + poi.puid + ".jpg";
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.toiletModal.hide();
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

  $scope.findClosestToilet = function (poi) {

    var distances = [];
    var closest = -1;

    var lat1 = poi.coordinates_lat;
    var lon1 = poi.coordinates_lon;

    var latLng1 = new google.maps.LatLng(lat1, lon1);

    console.log("Checkin distance to " + poi.name);
    console.log("Position" + latLng1);

    var pois = $scope.pois;
    for( i=0;i<pois.length; i++ ) {
        if (pois[i].name != poi.name
          && pois[i].pois_type == 'Toilets'
          && pois[i].floor_number == poi.floor_number) {

          var lat2 = pois[i].coordinates_lat;
          var lon2 = pois[i].coordinates_lon;

          var latLng2 = new google.maps.LatLng(lat2, lon2);

          var d = google.maps.geometry.spherical.computeDistanceBetween(latLng1, latLng2);

          distances[i] = d;
          if ( closest == -1 || d < distances[closest] ) {
              closest = i;
              console.log(pois[closest].name + " -> distance: " + d);
              console.log("Position" + latLng2);
          }
        }
    }

    if (pois[closest]) {
      $scope.closetToiletMessage = "The closest toilet in your floor is "
        + pois[closest].name + ". Coordinates -> "
        + pois[closest].coordinates_lat + ":" + pois[closest].coordinates_lon;
      $scope.closestToiletImg = 'http://localhost:8100/images/' + pois[closest].puid + ".jpg";
    }
    else {
      $scope.closetToiletMessage = "There are no toilets in this floor";
    }
    $scope.toiletModal.show();
  }

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
    $scope.toiletModal.remove();
  });

});
