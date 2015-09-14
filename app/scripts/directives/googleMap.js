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
	                backgroundColor: 'none',
	                /*styles: [
	                	{
	                		"featureType":"all",
	                		"stylers":[
	                			{
	                				"lightness":33
	                			}
	                		]
	                	},
	                	{
    						featureType: 'road',
    						stylers: [
      							{ visibility: 'off' }
    						]
  						},
	                	{
    						featureType: 'train',
    						stylers: [
      							{ visibility: 'off' }
    						]
  						}
  					]*/
	                styles: [
	                	{"featureType":"all","stylers":[{"visibility":"off"}]},
	                	{"featureType": "administrative","elementType": "labels.text", "stylers": [{ "visibility": "on" }]},
	                	{"featureType": "administrative","elementType": "labels.text.stroke", "stylers": [{ "visibility": "off" }]},
	                	{"featureType": "administrative","elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }]}
	                ]
	                //styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#adcedb"},{"visibility":"on"}]}] 
	                /*mapTypeId: google.maps.MapTypeId.SATELLITE*/
	            };
	            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	            //map.panBy(-150, 0);
			}
		};
	});
angular.module('app.directives.googlePath', [])
	.directive('googlePath', ['markerService', 'lineService', function(markerService, lineService) {
		return {
			restrict: 'E',
			scope: {
				data: '='
			},
			controller: function($scope) {
				//var line = sObj['paths'][$scope.data];
				var line = lineService.buildLine('paths', $scope.data);
				var lineLen = line.length;
				var pathLen, path, point, i, j, sid, pathCoords, coords, mObj;
				for (i=0; i<lineLen; i++) {
					path = line[i];
					pathLen = line[i].length;
					pathCoords = [];
					for (j=0; j<pathLen; j++) {
						point = path[j];
						pathLen = pathLen;
						sid = sObj['sid'][point];
						mObj = {
							id: point,
							lat: sid['lat'],
							lon: sid['lon'],
							icon: {
								path: google.maps.SymbolPath.CIRCLE,
								fillOpacity: 1,
                    			strokeWeight: 1.5,
                    			strokeColor: sObj['lines'][$scope.data]['colour'],
                    			strokeOpacity: 0.5,
                    			scale: 6,
                    			fillColor: '#292929',
                    			zIndex: 1
							},
							info: {
								content: point,
								clickback: function() {
									location.replace('#/'+this.content+'/');
								}
							}
						};
						markerService.addMove(mObj);
						pathCoords.push(new google.maps.LatLng(sid['lat'], sid['lon']));
					}
					var linePath = new google.maps.Polyline({
					    path: pathCoords,
					    geodesic: true,
					    strokeColor: sObj['lines'][$scope.data]['colour'],
					    //strokeColor: '#ccc',
					    strokeOpacity: 0.5,
					    strokeWeight: 1.5
					});
					linePath.setMap(map);
				}
			}
		}
	}]);
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', ['lineService', 'locationService', 'markerService', function(lineService, locationService, markerService) {
        return {
			restrict: 'E',
			scope: {
				icon: '=',
				data: '=',
				timestamp: '=',
				station: '=',
				last: '='
			},
			controller: function($scope) {
				var mObj;
				switch ($scope.icon) {
					case 'train':
						var trainLoc = locationService.locateTrain($scope.data);
						if (trainLoc) {
							mObj = {
								id: $scope.data['uid'],
								lat: trainLoc['lat'],
								lon: trainLoc['lon'],
								icon: {
									path: google.maps.SymbolPath.CIRCLE,
									fillOpacity: 1,
	                    			strokeWeight: 0,
	                    			strokeColor: '#252525',
	                    			scale: 6,
	                    			fillColor: sObj['lines'][$scope.data['lineId']]['colour'],
	                    			zIndex: 3
								},
								info: {
									content: $scope.data['vehicleId'] + ': ' + $scope.data['currentLocation'] + ' towards ' + $scope.data['towards']
								},
								timestamp: $scope.timestamp
							};
							// Some trains have 'Check fron of train' thus no destination
	                		if ($scope.data['destinationNaptanId']) {
	                			// At
	                			var a = $scope.data['naptanId'].substring(8);
	                			// To
	                			var b = $scope.data['destinationNaptanId'].substring(8);
	                			// Caller
	                			var c = $scope.station;
	                			// If caller is destination or caller is current location, train on route
	                			if (c !== b && c !== a) {	                			
		                			// Route to contain a, b, c to be worth displaying train
		                			var stations = [a,b,c];
		                			// Check for a via station
		                			var via = $scope.data['towards'].split(' via ');
		                			if (via) {
										var sidVia = locationService.stationNameLookup(via[1]);
										if (sidVia) {
											stations.push(sidVia);
										}
									}
									// Get possible routes for the line
									var routes = lineService.buildLine('routes', $scope.data['lineId']);
									// Check for a valid route - containing all stations
									var route = lineService.findRoute(routes, stations);
									if (!route) {
										mObj = null;
									} else {
										// If Route found, check if train is on route
										var onRoute = lineService.onRoute(route[0], route[1], route[2]);
										// Exit if train not heading my way
										if (!onRoute) {
											mObj = null;
										}
									}
								}
	                		}
						}
						break;
					case 'station':
						mObj = {
							id: 'center',
							lat: $scope.data['lat'],
							lon: $scope.data['lon'],
							icon: {
								path: google.maps.SymbolPath.CIRCLE,
								fillOpacity: 1,
                    			strokeWeight: 1.5,
                    			strokeColor: '#fff',
                    			scale: 7,
                    			fillColor: '#292929',
                    			zIndex: 2
							},
							info: {
								content: $scope.data['name']
							}
						};
						break;
				}
				if (mObj) {
					markerService.addMove(mObj);
				}
				if ($scope.last) {
					markerService.removeOld($scope.timestamp);
				}
			}
		};
	}]);