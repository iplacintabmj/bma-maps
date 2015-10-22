angular.module('starter.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(51.526127, -0.128448),  
          zoom: 18,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map($element[0], mapOptions);
		console.log(map);
        //$scope.onCreate({map: map});
		
		//try something
		var imageBounds = {
			north: 51.526870,   
			south: 51.525407,
			east: -0.127541,     
			west: -0.129780   
		};

		structuralOverlay = new google.maps.GroundOverlay(
			'/img/ground_rotated.png', imageBounds);
        structuralOverlay.setMap(map);

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
});
