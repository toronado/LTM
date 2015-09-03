angular.module('app.directives.googleMap', [])
	.directive('googleMap', function() {
		return {
			restrict: 'E', //Element E, Attribute A
			scope: {
				center: '='
			},
			replace: true, //replace custom html with compliant html
			transclude: true, //allow other html without overwriting
			templateUrl:'views/directives/googleMap.html',
			controller: function($scope) {
				var mapOptions = {
	                zoom: 13,
	                center: new google.maps.LatLng($scope.center['lat'], $scope.center['lon']),
	                disableDefaultUI: true,
	                //backgroundColor: '#222',
	                styles: [{"featureType":"all","stylers":[{"lightness":33}]}]
	                //styles: [{"featureType":"all","stylers":[{"visibility":"off"}]}]
	                //styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#adcedb"},{"visibility":"on"}]}] 
	                /*mapTypeId: google.maps.MapTypeId.SATELLITE*/
	            };
	            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	            /*if ($scope.marker) {
		            markerService.addMarker('center', $scope.center);
		        }*/
			}
		};
	});
angular.module('app.directives.googlePath', [])
	.directive('googlePath', ['markerService', function(markerService) {
		return {
			restrict: 'E',
			scope: {
				data: '='
			},
			controller: function($scope) {
				var line = sObj['paths'][$scope.data];
				var lineLen = line.length;
				var pathLen, path, point, i, j, sid, pathCoords, coords;
				for (i=0; i<lineLen; i++) {
					path = line[i];
					pathLen = line[i].length;
					pathCoords = [];
					for (j=0; j<pathLen; j++) {
						point = path[j];
						pathLen = pathLen;
						sid = sObj['sid'][point];
						//if (Object.keys(sid['line']).length > 1) {
							//markerService.addMarker('station', coords);
						//}
						var mObj = {
							scale: 4,
							color: '#999999',
							lat: sid['lat'],
							lon: sid['lon'],
							info: sid['name'],
							id: point
						};
						markerService.addMove(mObj);
						pathCoords.push(new google.maps.LatLng(sid['lat'], sid['lon']));
					}
					var linePath = new google.maps.Polyline({
					    path: pathCoords,
					    geodesic: true,
					    strokeColor: sObj['colors'][$scope.data],
					    strokeOpacity: 0.5,
					    strokeWeight: 1.5
					});
					linePath.setMap(map);
				}
			}
		}
	}]);
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', ['locationService', 'markerService', function(locationService, markerService) {
        return {
			restrict: 'E',
			scope: {
				icon: '=',
				data: '=',
				timestamp: '=',
				last: '='
			},
			controller: function($scope) {
				switch ($scope.icon) {
					case 'train':
						var trainLoc = locationService.locateTrain($scope.data);
						if (!trainLoc) return;
						var mObj = {
							scale: 7,
							color: sObj['colors'][$scope.data['lineId']],
							lat: trainLoc['lat'],
							lon: trainLoc['lon'],
							info: {
								content: $scope.data['vehicleId'] + $scope.data['currentLocation'],
								ux: 'hover'
							},
							id: $scope.data['uid'],
							timestamp: $scope.timestamp
						};
						if ($scope.last) {
							//console.log(markerService.get());
							markerService.removeOld($scope.timestamp);
						}
						break;
					case 'station':
						var mObj = {
							scale: 6,
							color: '#000000',
							lat: $scope.data['lat'],
							lon: $scope.data['lon'],
							info: {
								content: $scope.data['name'],
								ux: 'hover'
							},
							id: 'center'
						};
						break;
				}
				markerService.addMove(mObj);
			}
		};
	}]);