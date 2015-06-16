'use strict';

var tubeLines = [
    /*0*/'bakerloo',
    /*1*/'central',
    /*2*/'circle',
    /*3*/'district',
    /*4*/'hammersmith-city',
    /*5*/'jubilee',
    /*6*/'metropolitan',
    /*7*/'northern',
    /*8*/'piccadilly',
    /*9*/'victoria',
    /*10*/'waterloo-city'
];

/**
 * @ngdoc function
 * @name tubeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tubeApp
 * app_id=3a9a79b8&app_key=028f9bbc54baa89d77c46b9b2b5ba833&
 */

//Main GET factory
tubeApp.factory('getData', function ($http) {
    return {
        dataSrc : {
            stnArrivals: 'https://api.tfl.gov.uk/StopPoint/%7Bids%7D/Arrivals',
            allArrivals: 'https://api.tfl.gov.uk/Line/%7Bids%7D/Arrivals?ids='+tubeLines[1],
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
    $scope.stationList = stationsObj;
    $scope.station = stationsObj[$routeParams.stationId];
    var trains = {};
    var arr=[];

    getData.fetch('allArrivals', null, false, function (data) {
        //$scope.arrivals = data;
        for (var i=0; i<data.length; i++) {
            var tid = data[i]['lineId'].substring(0,2)+data[i]['vehicleId'];
            if (trains[tid]) {
                if (data[i]['timeToStation'] < trains[tid]['timeToStation']) {
                    trains[tid] = data[i];
                }
            } else {
                trains[tid] = data[i];
            }
        }
        for (var key in trains) {
            arr.push(trains[key]);
        }
        $scope.arrivals = arr;
    });
});
