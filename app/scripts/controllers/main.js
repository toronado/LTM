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
            allArrivals: 'https://api.tfl.gov.uk/Line/%7Bids%7D/Arrivals?ids='+tubeLines[7],
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

tubeApp.factory('genericServices', function ($http) {
    return {
        stationLookup: function(string) {
            if (stationLookup[string]) {
                return stationLookup[string];
            }
            return string + ' not found.';
        }
    };
});

tubeApp.controller('MainCtrl', function ($scope, $routeParams, getData, genericServices) {
    $scope.stationList = stationsObj;
    $scope.station = stationsObj[$routeParams.stationId];
    var trains = {};
    var arr=[];

    //console.log(genericServices.stationLookup('Barkingsides'));
    getData.fetch('allArrivals', null, false, function (data) {
        //$scope.arrivals = data;
        var errors = [];
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
        for (var j=0; j<arr.length; j++) {
            var cl = data[j]['currentLocation'].split(' Platform')[0];
            var tts = data[j]['timeToStation'];
            var cls = null;
            switch (tts) {
                case 0:
                    console.log(data[j]['naptanId'].substring(8));
                default:
                    switch (cl.substring(0,2)) {
                        case 'At':
                            console.log(data[j]['naptanId'].substring(8));
                            break;
                        case 'De':
                            cls = cl.split('Departed ')[1];
                            break;
                        case 'Ap':
                            cls = cl.split('Approaching ')[1];
                            break;
                        case 'Be':
                            cls = cl.split(' and ')[0].substring(8);
                            break;
                        case 'Le': 
                            cls = cl.split('Left ')[1]
                            break;
                        case 'No':
                        case 'So':
                        case 'Ea':
                        case 'We':
                            cls = cl.split(' of ')[1]
                            break;
                        default:
                            errors.push(data[j]['vehicleId']);
                    }
            }
            if (cls) {
                switch (true) {
                    case (cls.indexOf(",") > -1):
                        cls = cls.split(',')[0];
                        break;
                }
                console.log(genericServices.stationLookup(cls.trim()));
            }
        }
        console.log(errors);
        $scope.arrivals = arr;
    });
});
