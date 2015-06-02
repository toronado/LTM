'use strict';

/**
 * @ngdoc function
 * @name tubeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tubeApp
 */

//Main GET factory
tubeApp.factory('getData', function ($http) {
    return {
        dataSrc : {
            arrivals: 'https://api.tfl.gov.uk/StopPoint/%7Bids%7D/Arrivals',
            stations: 'data/stations.min.json'
        },
        fetch : function (dataSrc, params, cache, callback) {
            $http({
                method: 'GET',
                url: this.dataSrc[dataSrc],
                cache: cache,
                params: params
            }).success(callback);
        }
    };
});

tubeApp.controller('MainCtrl', function ($scope, $routeParams, getData) {
    $scope.markers = [
        [51.5,-0.5],
        [49.27,-0.20],
        [30.1,-0.1]
    ];
    getData.fetch('stations', null, true, function (data) {
        $scope.stationList = data;
        $scope.station = data[$routeParams.stationId];
        var lat = $scope.station.lat;
        var lon = $scope.station.lon;
        $scope.map = { 
        	center: { 
        		latitude: lat, 
        		longitude: lon
        	},
        	zoom: 15
        };
        $scope.marker = {
        	coords: {
        		latitude: lat,
        		longitude: lon
        	}
        }
    });
});
