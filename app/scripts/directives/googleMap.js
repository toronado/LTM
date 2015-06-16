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
				lat: '=',
				lon: '=',
				tts: '=',
				cls: '='
			},
			require: "googleMap",
			controller: function($scope) {
				if ($scope.tts) {
					//console.log($scope.cls);
		        } else {
		        	var location = new google.maps.LatLng($scope.lat, $scope.lon);
		            var marker = new google.maps.Marker({
		                position: location,
		                map: map
		            });
		        }
			}
		};
	});