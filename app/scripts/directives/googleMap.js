angular.module('app.directives.googleMap', [])
	.directive('googleMap', function() {
		return {
			restrict: 'E', //Element E, Attribute A
			scope: {
				path: '=',
				center: '=',
				map: '=' //look for attribute value(=)
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
	                center: center//,
	                /*mapTypeId: google.maps.MapTypeId.SATELLITE,
	                disableDefaultUI: true*/
	            };
	            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	            var location = new google.maps.LatLng(lat, lon);
	            var marker = new google.maps.Marker({
	                position: location,
	                map: map
	            });
	            var flightPlanCoordinates = [
				    new google.maps.LatLng(51.585695, 0.088596),
				    new google.maps.LatLng(51.575732, 0.090015),
				    new google.maps.LatLng(51.57655, 0.066195),
				    new google.maps.LatLng(51.576249, 0.045369)
				];
				var flightPath = new google.maps.Polyline({
				    path: flightPlanCoordinates,
				    geodesic: true,
				    strokeColor: '#FF0000',
				    strokeOpacity: 1.0,
				    strokeWeight: 2
				});
				flightPath.setMap(map);
	            $scope.map = map;
	            /*var infowindow = new google.maps.InfoWindow({
	                content: $scope.data.name
	            });
	            infowindow.open(map,marker);*/
			}
		};
	});
angular.module('app.directives.googleMarker', [])
	.directive('googleMarker', ['locationService', function(locationService) {
		var colors = {
            'bakerloo': '#AE6118',
            'central': '#E41F1F',
            'circle': '#F8D42D',
            'district': '#007229',
            'hammersmith-city': '#E899A8',
            'jubilee': '#686E72',
            'metropolitan': '#893267',
            'northern': '#000000',
            'piccadilly': '#0450A1',
            'victoria': '#009FE0',
            'waterloo-city': '#70C3CE'
        };
        return {
			restrict: 'E',
			scope: {
				train: '=',
				map: '=',
				markers: '='
			},
			controller: function($scope) {
				//Get the location of the train, exit if null
				var trainLoc = locationService.locateTrain($scope.train);
				if (!trainLoc) return;
				
				//Check if train already has a marker
				var trainUid = $scope.train.uid;
				if ($scope.markers[trainUid]) {
					$scope.train.todo = 'move';
				} else {
					$scope.train.todo = 'add';
					$scope.markers[trainUid] = $scope.train;
				}

				//Google map marker location
				var location = new google.maps.LatLng(trainLoc.lat, trainLoc.lon);
				//Marker popup messsage
				var info = $scope.train['currentLocation'];

				//What todo?
				switch ($scope.train.todo) {
					case 'add':
						var map = $scope.map;
						var marker = new google.maps.Marker({
			                position: location,
			                icon: {
			                    path: google.maps.SymbolPath.CIRCLE,
			                    scale: 5,
			                    fillOpacity: 1,
			                    fillColor: colors[$scope.train.lineId],
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
			            // Update markers object with Google marker object
			            $scope.markers[trainUid]['gObj'] = {
			            	'marker': marker,
			            	'info': infowindow
			            }
						break;
					case 'move':
						var gObj = $scope.markers[trainUid]['gObj'];
						//gObj['marker'].setPosition(location);
						gObj['marker'].animateTo(location, {easing: 'linear', duration: 2000});
						gObj['info'].setContent(info);
						break;
					case 'remove':
						console.log($scope.train);
						$scope.train['gObj']['marker'].setMap(null);
						break;
					default:
						console.log('unknown!!!');
				}
			}
		};
	}])
	.directive('trainRepeatDirective', function() {
  		return function(scope, element, attrs) {
    		if (scope.$last) {
    			console.log(scope.markers);
      			//window.alert("im the last!");
    		}
  		};
	});