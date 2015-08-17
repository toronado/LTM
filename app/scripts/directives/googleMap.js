angular.module('app.directives.googleMap', [])
	.directive('googleMap', function() {
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
	                disableDefaultUI: true
	                /*mapTypeId: google.maps.MapTypeId.SATELLITE*/
	            };
	            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	            if ($scope.marker) {
		            var location = new google.maps.LatLng(lat, lon);
		            var marker = new google.maps.Marker({
		                position: location,
		                map: map
		            });
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
				                    scale: 8,
				                    fillOpacity: 1,
				                    fillColor: '#ffffff',
				                    strokeWeight:3,
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
	});
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', ['locationService', function(locationService) {
        return {
			restrict: 'E',
			scope: {
				type: '=',
				data: '=',
				markers: '=',
				timestamp: '='
			},
			controller: function($scope) {
				switch($scope.type) {
					case 'train':
						//Get the location of the train, exit if null
						var trainLoc = locationService.locateTrain($scope.data);
						if (!trainLoc) return;
						//Google map marker location
						var location = new google.maps.LatLng(trainLoc.lat, trainLoc.lon);
						//Marker popup messsage
						var info = $scope.data['currentLocation'];

						//Check if train already has a marker
						var trainUid = $scope.data.uid;
						if ($scope.markers[trainUid]) {
							var mObj = $scope.markers[trainUid];
							//mObj['marker'].setPosition(location);
							mObj['marker'].animateTo(location, {easing: 'linear', duration: 5000});
							mObj['info'].setContent(info);
							mObj['data'] = $scope.data;
						} else {
							//var map = $scope.map;
							var marker = new google.maps.Marker({
				                position: location,
				                icon: {
				                    path: google.maps.SymbolPath.CIRCLE,
				                    scale: 5,
				                    fillOpacity: 1,
				                    fillColor: sObj['colors'][$scope.data.lineId],
				                    strokeWeight:0
				                },
				                map: map
				            });
				            var infowindow = new google.maps.InfoWindow({
				                maxWidth: 200,
				                content: info
				            });
				            google.maps.event.addListener(marker, 'mouseover', function () {
			                	infowindow.open(map,marker);
				            });
				            google.maps.event.addListener(marker, 'mouseout', function () {
				                infowindow.close(map,marker);
				            });
				            // Update markers object with market data
				            $scope.markers[trainUid] = {
				            	'marker': marker,
				            	'info': infowindow,
				            	'data': $scope.data
				            }
						}
						$scope.markers[trainUid]['timestamp'] = $scope.timestamp;
					break;
				}
			}
		};
	}])
	.directive('trainRepeatDirective', function() {
  		return function(scope, element, attrs) {
    		if (scope.$last) {
    			var m, marker;
    			for (m in scope.markers) {
    				marker = scope.markers[m]
    				if (marker['timestamp'] !== scope.timestamp) {
    					marker['marker'].setMap(null);
    					console.log(marker);
    					delete scope.markers[m];
    				}
    			}
    		}
  		};
	});