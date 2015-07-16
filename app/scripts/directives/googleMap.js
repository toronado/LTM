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
		var colors = {
            'bakerloo' : '#AE6118',
            'central' : '#E41F1F',
            'circle' : '#F8D42D',
            'district' : '#007229',
            'hammersmith-city' : '#E899A8',
            'jubilee' : '#686E72',
            'metropolitan' : '#893267',
            'northern' : '#000000',
            'piccadilly' : '#0450A1',
            'victoria' : '#009FE0',
            'waterloo-city' : '#70C3CE'
        };
		return {
			restrict: 'E',
			scope: {
				data: '='
			},
			require: "googleMap",
			controller: function($scope) {
				var location = new google.maps.LatLng($scope.data.coords.lat, $scope.data.coords.lon);
	            var marker = new google.maps.Marker({
	                position: location,
	                icon: {
	                    path: google.maps.SymbolPath.CIRCLE,
	                    scale: 3,
	                    fillOpacity: 1,
	                    fillColor: colors[$scope.data.lineId],
	                    strokeWeight:0
	                },
	                map: map
	            });
	            var infowindow = new google.maps.InfoWindow({
	                content: $scope.data.currentLocation,
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