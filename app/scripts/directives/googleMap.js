angular.module('app.directives.googleMap', [])
	.directive('googleMap', function() {
		return {
			restrict: 'E', //Element E, Attribute A
			scope: {
				station: '=' //look for attribute value(=)
			},
			replace: true, //replace custom html with compliant html
			transclude: true, //allow other html without overwriting
			templateUrl:'views/directives/googleMap.html',
			link: function(scope, element, attrs) { //no dependancy injection
				/*var center = new google.maps.LatLng(0, 0);
	            var mapOptions = {
	                zoom: 12,
	                backgroundColor: '#000000',
	                center: center,
	                disableDefaultUI: true
	            };
            	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);*/
				element.click(function() {
					alert('hello');
				});
			},
			controller: function($scope) {
				console.log($scope.station);
			}
		}
	});