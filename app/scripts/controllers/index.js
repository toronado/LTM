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
    $scope.listVisible = false;
    $scope.showList = function(n) {
        if (n === '1') {
            $scope.listVisible = true;
        } else {
            $scope.listVisible = false;
            $scope.searchTerm = '';
        }
    }
});
