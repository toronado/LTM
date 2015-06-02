angular.module('app.directives.googleMap', [])
	.directive('googleMap', function() {
		return {
			restrict: 'E', //Element E, Attribute A
			scope: {
				obj: '=', //look for attribute value(=)
				lat: '=',
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
				console.log($scope.obj);
				var center = new google.maps.LatLng($scope.lat, $scope.lon);
				var mapOptions = {
	                zoom: 12,
	                backgroundColor: '#000000',
	                center: center,
	                disableDefaultUI: true
	            };
	            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
			}
		}
	});
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', function() {
		return {
			restrict: 'E',
			scope: {
				lat: '=',
				lon: '='
			},
			require: "googleMap",
			controller: function($scope) {
				var location = new google.maps.LatLng($scope.lat, $scope.lon);
	            var marker = new google.maps.Marker({
	                position: location,
	                map: map
	            });
			}
		}
	});