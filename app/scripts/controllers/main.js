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
            if (!name) return null;
            name = name.trim();
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
        clsTrainLocate: function (train) {
            var cls = train['currentLocation'].replace(/,| depot| sidings| platform.*$|/gi,''); // Current Location String - Remove unwanted things
            var sid = train['naptanId'].substring(8);
            var tts = train['timeToStation'];
            var dot = train['platformName'].split(' ')[0].toLowerCase();
            var lid = train['lineId'];
            switch (cls.substring(0,2)) {
                case 'Be': //Between
                    cls = cls.substring(8).split(' and ');
                    var a = this.stationNameLookup(cls[0]); //From
                    var b = this.stationNameLookup(cls[1]); //To
                    if (!a || !b) return false;
                    return this.newLatLon(sObj['sid'][a], sObj['sid'][b], 0.5);
                case 'Le': //Left,Leaving
                case 'De': //Departed
                    var a = this.stationNameLookup(cls.substring(cls.indexOf(' ')+1));
                    var b = sObj['sid'][sid];
                    if (!a || !b) return false;
                    return this.newLatLon(sObj['sid'][a], b, 0.1);
                case 'Ap': //Approaching
                    var a = sObj['sid'][sid];
                    var lines = a['line'][lid];
                    if (!lines && lid === 'hammersmith-city') {
                        lines = a['line']['district'];
                    }
                    for (var platform in lines) {
                        if (platform !== dot) {
                            var origins = lines[platform];
                            for (var origin in origins) {
                                b = origin;
                                break;
                            }
                        }
                    }
                    if (!a || !b) return false;
                    return this.newLatLon(sObj['sid'][b], a, 0.9);
                default: //At, Approaching, Departed, Left
                    cls = cls.substr(cls.indexOf(' ')+1);
                    var a = this.stationNameLookup(cls);
                    if (!a) {
                        return false;
                    }
                    var stn = sObj['sid'][a];
                    return {
                        'lat': stn['lat'],
                        'lon': stn['lon'],
                    }
            }
        },
        ttsTrainLocate: function(train) {
            //stations-lines-platforms at a fork
            var fork = {"ACTpiccadillywestbound":2,"ERCcirclewestbound":2,"EUSnorthernnorthbound":2,"EUSnorthernsouthbound":2,"WOFcentraleastbound":2,"ECTdistricteastbound":2,"ECTdistrictwestbound":3,"CTNnorthernnorthbound":2,"CTNnorthernsouthbound":2,"HOHmetropolitannorthbound":2,"NANcentralwestbound":2,"TNGdistrictwestbound":2,"HNXpiccadillywestbound":2,"LYScentraleastbound":2,"RKWmetropolitansouthbound":2,"KNGnorthernnorthbound":2,"CALmetropolitannorthbound":2,"CXYmetropolitansouthbound":3,"MPKmetropolitannorthbound":2,"FYCnorthernnorthbound":2};
            //Station ID - time to station is relative to this station
            var sid = train['naptanId'].substring(8);
            //Station Object
            var stn = sObj['sid'][sid]; 
            //Line ID
            var lid = train['lineId'];
            //Direction Of Travel
            var dot = train['platformName'].split(' ')[0].toLowerCase(); //(N)orth/(E)ast/(S)outh/(W)est/(I)nner/(O)uter
            //Time To Station
            var tts = train['timeToStation'];
            //From station ID - Opposite direction to it's heading
            var fid = null;
            //known Time Between Stations
            var tbs = null;
            //Possible Origins Object
            var posObj = stn['line'][lid];
            if (!posObj) return null;
            for (var platform in posObj) {
                //Check if it's a junction
                if (fork[sid+lid+platform]) return false;
                if (platform !== dot) {
                    var fidObj = posObj[platform];
                    for (var key in fidObj) {
                        fid = key;
                        tbs = fidObj[key];
                    }
                }
            }
            if (!tbs) return null;
            //Check time to station is less than time between stations. 30s leeway.
            var ratio = null;
            if (tts <= tbs+30) {
                if (tts <= tbs) {
                    ratio = Math.round((tts/tbs)*1000)/1000;
                } else {
                    ratio = Math.round((tts/tbs+30)*1000)/1000;
                }
            }
            if (ratio) {
                return this.newLatLon(stn, sObj['sid'][fid], ratio);
            }
            return null;
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
                    case 0: //Train is at the station - no need to locate
                        train['coords'] = {
                            'lat': stn['lat'],
                            'lon': stn['lon']
                        };
                        break;
                    default:
                        switch (train['currentLocation']) {
                            case 'At Platform': //At a station
                                train['coords'] = {
                                    'lat': stn['lat'],
                                    'lon': stn['lon']
                                };
                                break;
                            default:
                                var coords = this.ttsTrainLocate(train);
                                if (coords) {
                                    train['coords'] = coords;
                                } else {
                                    train['coords'] = this.clsTrainLocate(train);
                                }
                        }
                }
                if (train['coords']) {
                    trainMarkers.push(train);
                } else {
                    console.log(train);
                }
            }
            console.log(trainMarkers.length + '/' + data.length);
            return trainMarkers;
        }
    };
});
tubeApp.controller('MainCtrl', function ($scope, $routeParams, getData, genericServices) {
    
    var data = [
        {  
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"350528073",
            "operationType":1,
            "vehicleId":"213",
            "naptanId":"940GZZLUEAC",
            "stationName":"Elephant & Castle Underground Station",
            "lineId":"bakerloo",
            "lineName":"Bakerloo",
            "platformName":"Northbound - Platform 3",
            "destinationNaptanId":"940GZZLUEAC",
            "destinationName":"Elephant & Castle Underground Station",
            "timestamp":"2015-07-02T15:23:48.382Z",
            "timeToStation":120,
            "currentLocation":"South of Lambeth North",
            "towards":"Elephant and Castle",
            "expectedArrival":"2015-07-02T15:25:48.382Z",
            "timeToLive":"2015-07-02T15:25:48.382Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:410"
        },
        {
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"-454320232",
            "operationType":1,
            "vehicleId":"226",
            "naptanId":"940GZZLUHNX",
            "stationName":"Hatton Cross Underground Station",
            "lineId":"piccadilly",
            "lineName":"Piccadilly",
            "platformName":"Eastbound - Platform 2",
            "direction":"outbound",
            "destinationNaptanId":"940GZZLUCKS",
            "destinationName":"Cockfosters Underground Station",
            "timestamp":"2015-07-02T22:41:12.768Z",
            "timeToStation":118,
            "currentLocation":"Between Heathrow and Hatton Cross",
            "towards":"Cockfosters",
            "expectedArrival":"2015-07-02T22:43:10.768Z",
            "timeToLive":"2015-07-02T22:43:10.768Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:288"
        },
        {
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"2001557230",
            "operationType":1,
            "vehicleId":"212",
            "naptanId":"940GZZLUEAC",
            "stationName":"Elephant & Castle Underground Station",
            "lineId":"bakerloo",
            "lineName":"Bakerloo",
            "platformName":"Northbound - Platform 4",
            "destinationNaptanId":"940GZZLUEAC",
            "destinationName":"Elephant & Castle Underground Station",
            "timestamp":"2015-07-02T22:41:11.565Z",
            "timeToStation":59,
            "currentLocation":"Approaching Elephant & Castle",
            "towards":"Elephant and Castle",
            "expectedArrival":"2015-07-02T22:42:10.565Z",
            "timeToLive":"2015-07-02T22:42:10.565Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:229"
        },
        {
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"-674253855",
            "operationType":1,
            "vehicleId":"201",
            "naptanId":"940GZZLUWLO",
            "stationName":"Waterloo Underground Station",
            "lineId":"waterloo-city",
            "lineName":"Waterloo & City",
            "platformName":"Westbound Platform 26",
            "destinationNaptanId":"940GZZLUWLO",
            "destinationName":"Waterloo Underground Station",
            "timestamp":"2015-07-02T22:41:11.049Z",
            "timeToStation":30,
            "currentLocation":"Approaching Waterloo",
            "towards":"Waterloo",
            "expectedArrival":"2015-07-02T22:41:41.049Z",
            "timeToLive":"2015-07-02T22:41:41.049Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:185"
        },
        {
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"-366199147",
            "operationType":1,
            "vehicleId":"123",
            "naptanId":"940GZZLUMDN",
            "stationName":"Morden Underground Station",
            "lineId":"northern",
            "lineName":"Northern",
            "platformName":"Northbound - Platform 5",
            "destinationNaptanId":"940GZZLUMDN",
            "destinationName":"Morden Underground Station",
            "timestamp":"2015-07-02T22:40:39.549Z",
            "timeToStation":26,
            "currentLocation":"Approaching Morden",
            "towards":"Morden via Bank",
            "expectedArrival":"2015-07-02T22:41:05.549Z",
            "timeToLive":"2015-07-02T22:41:05.549Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:146"
        },
        {
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"82191388",
            "operationType":1,
            "vehicleId":"115",
            "naptanId":"940GZZLUKNG",
            "stationName":"Kennington Underground Station",
            "lineId":"northern",
            "lineName":"Northern",
            "platformName":"Southbound - Platform 4",
            "direction":"inbound",
            "destinationNaptanId":"940GZZLUMDN",
            "destinationName":"Morden Underground Station",
            "timestamp":"2015-07-02T22:41:14.096Z",
            "timeToStation":27,
            "currentLocation":"Between Elephant and Castle and Kennington",
            "towards":"Morden via Bank",
            "expectedArrival":"2015-07-02T22:41:41.096Z",
            "timeToLive":"2015-07-02T22:41:41.096Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:151"
        }
    ];
    $scope.stationList = sObj['sid'];
    $scope.station = sObj['sid'][$routeParams.stationId];
    //getData.fetch('allArrivals', null, false, function (data) {
        //consolidate the data first
        $scope.arrivals = genericServices.unifyData(data);
        $scope.markers = genericServices.getArrivals($scope.arrivals);

    //});
});
