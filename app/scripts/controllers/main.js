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
        [51.506951,-0.142783],
        [51.50398,-0.104935],
        [51.497957,-0.063762]
    ];
    $scope.stationList = stationsObj;
    $scope.station = stationsObj[$routeParams.stationId];

    getData.fetch('arrivals', {ids: '940GZZLU' + $routeParams.stationId}, false, function (data) {
        $scope.arrivals = data;
    });
});
