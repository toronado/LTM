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
        stationNameLookup: function(name) {
            if (sObj['sidLookup'][name]) {
                return sObj['sidLookup'][name];
            }
            return null;
        },
        newLatLon: function(a, b, ratio) {
            if (ratio > 1) ratio = 0.5; //When a train's between a and b but the tts is relative to c, make it half way between a and b.
            return {
                'lat': a['lat'] + ((b['lat'] - a['lat']) * ratio),
                'lon': a['lon'] + ((b['lon'] - a['lon']) * ratio)
            }
        },
        unifyData: function(data) {
            //TFL data contains multiple instances of the same train
            //Need to consolidate to the nearest station using 'timeToStation'
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
        locateTrain: function (cls) {
            switch (cls.charAt(0)) {
                case 'B': //Between
                    cls = cls.substring(8).split(' and ');
                    var a = this.stationNameLookup(cls[0]); //From
                    var b = this.stationNameLookup(cls[1]); //To
                    return this.newLatLon(sObj['sid'][a], sObj['sid'][b], 0.5);
                default: //At, Approaching, Departed, Left
                    cls = cls.substr(cls.indexOf(' ')+1);
                    var a = this.stationNameLookup(cls);
                    if (!a) {
                        console.log(cls);
                        return false;
                    }
                    var stn = sObj['sid'][a];
                    return {
                        'lat': stn['lat'],
                        'lon': stn['lon'],
                    }
            }
        },
        getArrivals: function(data) {
            //Convert Location String to a Coordinate!
            var trainMarkers = [];
            var i;
            var dataLength = data.length;
            for (i=0; i<dataLength; i++) {

                var train = data[i];
                var sid = train['naptanId'].substring(8); //Station ID
                var stn = sObj['sid'][sid] || null; //Station Object
                if (!stn) continue;
                var tts = train['timeToStation']; //Time to Station

                switch (tts) {
                    case 0: //Train is at the station - no need to look at string
                        train['coords'] = {
                            'lat': stn['lat'],
                            'lon': stn['lon']
                        };
                        break;
                    default:
                        var cls = train['currentLocation'].replace(/,| depot| sidings| platform.*$|/gi,''); // Current Location String - Remove unwanted string things
                        switch (cls) {
                            case 'At Platform': //At a station
                                train['coords'] = {
                                    'lat': stn['lat'],
                                    'lon': stn['lon']
                                };
                                break;
                            default:
                                var lid = train['lineId']; //Line
                                var lineObj = stn['line'][lid];
                                if (!lineObj) {
                                    console.log(train);
                                    continue;
                                }
                                //Check that the train only has 2 possible routes (i.e. it's not at a fork).
                                if (Object.keys(lineObj).length < 3) {
                                    for (var platform in lineObj) {
                                        //Train coming towards a station will be coming from the opp direction to which it's going
                                        var pna = train['platformName'].split(' ')[0].toLowerCase();
                                        if (platform !== pna) {
                                            var direction = lineObj[platform];
                                            for (var station in direction) {
                                                //Time between stations
                                                var tst = direction[station]; //Time it should take from a to b
                                                if (tts <= tst) {
                                                    var ratio = Math.round((tts/tst)*1000)/1000;
                                                    train['coords'] = this.newLatLon(stn, sObj['sid'][station], ratio);
                                                } else {
                                                    if (tts <= tst+30) {
                                                        var ratio = Math.round((tts/tst+30)*1000)/1000;
                                                        train['coords'] = this.newLatLon(stn, sObj['sid'][station], ratio);
                                                    } else {
                                                        train['coords'] = this.locateTrain(cls);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    console.log('Fork?!');
                                }
                        }
                }
                if (train['coords']) {
                    trainMarkers.push(train);
                } else {
                    console.log(train);
                }
            }
            console.log(trainMarkers.length);
            return trainMarkers;
        }
    };
});
tubeApp.controller('MainCtrl', function ($scope, $routeParams, getData, genericServices) {

    $scope.stationList = sObj['sid'];
    $scope.station = sObj['sid'][$routeParams.stationId];

    getData.fetch('allArrivals', null, false, function (data) {
        //consolidate the data first
        $scope.arrivals = genericServices.unifyData(data);
        $scope.markers = genericServices.getArrivals($scope.arrivals);

    });
});
