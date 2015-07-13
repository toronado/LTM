angular.module('app.directives.googleMap', [])
	.directive('googleMap', function() {
		return {
			restrict: 'E', //Element E, Attribute A
			scope: {
				lat: '=', //look for attribute value(=)
				lon: '='
			},
			replace: true, //replace custom html with compliant html
			transclude: true, //allow other html without overwriting
			templateUrl:'views/directives/googleMap.html',
			link: function(scope, element, attrs) { //no dependancy injection
				/*element.click(function() {
					alert('hello');
				});*/
			},
			controller: function($scope) {
				var center = new google.maps.LatLng($scope.lat, $scope.lon);
				var mapOptions = {
	                zoom: 12,
	                center: center,
	                disableDefaultUI: true
	            };
	            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
			}
		};
	});
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', function() {
		return {
			restrict: 'E',
			scope: {
				marker: '='
			},
			require: "googleMap",
			controller: function($scope) {
				var location = new google.maps.LatLng($scope.marker.coords.lat, $scope.marker.coords.lon);
	            var marker = new google.maps.Marker({
	                position: location,
	                map: map,
	                uid: $scope.marker.uid
	            });
	            console.log(marker);
	            var infowindow = new google.maps.InfoWindow({
	                content: $scope.marker.currentLocation,
	                maxWidth: 200
	            });
	            google.maps.event.addListener(marker, 'mouseover', function () {
                	infowindow.open(map,marker);
	            });
	            google.maps.event.addListener(marker, 'mouseout', function () {
	                infowindow.close(map,marker);
	            });
			}
		};
	});