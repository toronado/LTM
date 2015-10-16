'use strict';

/**
 * @ngdoc function
 * @name tubeApp.controller:IndexCtrl
 * @description
 * # IndexCtrl
 * Controller of the tubeApp
 */
tubeApp.controller('IndexCtrl', function ($scope) {
	$scope.stations = sObj['sid'];
	var stations = [];
    var station;
    for (station in $scope.stations) {
        stations.push({
            'id': station,
            'name': $scope.stations[station]['name']
        });
    }
    $scope.stationList = stations;

    $scope.stationContainer = 0;
    $scope.binaryToggle = function(id) {
    	switch (id) {
    		case 'sc':
    		$scope.stationContainer = 1 - $scope.stationContainer;
    		break;
    	}
    }
});
