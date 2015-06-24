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
            allArrivals: 'https://api.tfl.gov.uk/Line/%7Bids%7D/Arrivals?ids='+tubeLines.join(),
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
        },
        newLatLon: function(a, b, ratio) {
            var lat = a['lat'] + ((b['lat'] - a['lat']) * ratio);
            var lon = a['lon'] + ((b['lon'] - a['lon']) * ratio);
            return {
                'lat': lat,
                'lon': lon
            }
    
        },
        unifyData: function(data) {
            //TFL data contains multiple instances of the same train.
            //Need to consolidate by least 'timeToStation'.

            var trainsArr, trainsObj, uid, i, dataLength, train;
            trainsArr = [];
            trainsObj = {};
            dataLength = data.length;

            for (i=0; i<dataLength; i++) {
                //UID = unique id for a train - combine line and vehicle id (vehicle id not unique across lines)
                uid = data[i]['lineId'].substring(0,2)+data[i]['vehicleId'];

                //Create new uid object
                if (!trainsObj[uid]) {
                    trainsObj[uid] = data[i];
                    continue;
                }
                //Check time to station, replace uid obj if tts is less.
                if (data[i]['timeToStation'] < trainsObj[uid]['timeToStation']) {
                    trainsObj[uid] = data[i];
                }
            }
            //Put data back into array of objects **** MIGHT NOT NEED ***
            for (train in trainsObj) {
                trainsArr.push(trainsObj[train]);
            }
            return trainsArr;
        },
        locateTrain: function(data) {
            //Convert Location String to a Coordinate!
            var i;
            var dataLength = data.length;
            for (i=0; i<dataLength; i++) {

                var cls = data[i]['currentLocation'].replace(/,| depot| sidings| platform.*$|/gi,''); //Remove unwanted things
                var tts = data[i]['timeToStation']; //Time to Station
                var sid = data[i]['naptanId'].substring(8); //Station ID
                var txy = null; //Train coordinates

                switch (tts) {
                    case 0: //Train is at the station - no need to look at string
                        txy = [sObj['sid'][sid]['lat'], sObj['sid'][sid]['lon']];
                        break;
                    default:
                        console.log(cls);
                        switch (cls.substring(0,2)) {
                            case 'At': //Sometimes a train can be at a station with tts > 0
                                txy = [sObj['sid'][sid]['lat'], sObj['sid'][sid]['lon']];
                                break;
                            case 'Be': //Between 2 stations, A and B
                                cls = cls.split(' and ');
                                var a = cls[0].substring(8); //strip 'Between'
                                var b = cls[1];
                                break;
                        }
                }
                if (txy) {
                    data[i]['coords'] = txy;
                }
            }
            return data;
        }
    };
});
tubeApp.controller('MainCtrl', function ($scope, $routeParams, getData, genericServices) {
    $scope.stationList = sObj['sid'];
    $scope.station = sObj['sid'][$routeParams.stationId];

    //console.log(genericServices.stationLookup('Barkingsides'));
    getData.fetch('allArrivals', null, false, function (data) {
        //$scope.arrivals = data;
        
        //consolidate the data first
        data = genericServices.unifyData(data);
        console.log(genericServices.locateTrain(data));

        /*var errors = [];
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
        console.log(errors);*/
        $scope.arrivals = data;
    });
});
