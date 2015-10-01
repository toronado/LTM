'use strict';

/**
 * @ngdoc function
 * @name tubeApp.controller:IndexCtrl
 * @description
 * # IndexCtrl
 * Controller of the tubeApp
 */
tubeApp.controller('IndexCtrl', function ($scope) {
	var stations = sObj['sid'];
	var arr = [];
	var station;
	for (station in stations) {
		stations[station]['id'] = station;
	    arr.push(stations[station]);
	}
	$scope.stationList = arr;
});
