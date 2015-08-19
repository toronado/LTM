angular.module('app.directives.googleMap', [])
	.directive('googleMap', ['markerService', function(markerService) {
		return {
			restrict: 'E', //Element E, Attribute A
			scope: {
				center: '=',
				marker: '=',
				path: '=' //look for attribute value(=)
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

				var lat = $scope.center.lat;
				var lon = $scope.center.lon;
				var center = new google.maps.LatLng(lat, lon);
				var mapOptions = {
	                zoom: 13,
	                center: center,
	                disableDefaultUI: true//,
	                //backgroundColor: '#222',
	                //styles: [{"featureType":"all","stylers":[{"visibility":"off"}]}]
	                /*mapTypeId: google.maps.MapTypeId.SATELLITE*/
	            };
	            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	            if ($scope.marker) {
		            markerService.addMarker('', {'coords':$scope.center});
		        }
	            for (var i=0; i<$scope.path.length; i++) {
					var flightPlanCoordinates = [];
					for (var j=0; j<$scope.path[i].length; j++) {
						var sid = sObj['sid'][$scope.path[i][j]]
						var lat = sid['lat'];
						var lon = sid['lon'];
						flightPlanCoordinates.push(new google.maps.LatLng(lat, lon));
						var location = new google.maps.LatLng(lat, lon);
						var marker = new google.maps.Marker({
				                position: location,
				                icon: {
				                    path: google.maps.SymbolPath.CIRCLE,
				                    scale: 7,
				                    fillOpacity: 1,
				                    fillColor: '#ffffff',
				                    strokeWeight:2,
				                    strokeColor: '#000000'
				                },
				                map: map
				            });
					}
					var flightPath = new google.maps.Polyline({
					    path: flightPlanCoordinates,
					    geodesic: true,
					    strokeColor: '#FF0000',
					    strokeOpacity: 1.0,
					    strokeWeight: 2
					});
					flightPath.setMap(map);
				}
	            /*var infowindow = new google.maps.InfoWindow({
	                content: $scope.data.name
	            });
	            infowindow.open(map,marker);*/
			}
		};
	}]);
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', ['locationService', 'markerService', function(locationService, markerService) {
        return {
			restrict: 'E',
			scope: {
				data: '=',
				timestamp: '=',
				last: '='
			},
			controller: function($scope) {
				//Get the location of the train, exit if null
				var trainLoc = locationService.locateTrain($scope.data);
				if (!trainLoc) return;

				$scope.data['coords'] = trainLoc;
				$scope.data['timestamp'] = $scope.timestamp;
				
				var trainUid = $scope.data.uid;
				if (markerService.markerCheck(trainUid)) {
					markerService.moveMarker(trainUid, $scope.data);
				} else {
					markerService.addMarker('train', $scope.data);
				}

				if ($scope.last) {
					markerService.removeOldMarkers($scope.timestamp);
				}
			}
		};
	}]);