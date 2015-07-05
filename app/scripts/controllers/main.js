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
                        'lon': stn['lon']
                    }
            }
        },
        locateTrain: function(train) {

            //Forks (naptan-line-platform:forks)
            var fork = {"ACTpiccadillywestbound":2,"ERCcirclewestbound":2,"EUSnorthernnorthbound":2,"EUSnorthernsouthbound":2,"WOFcentraleastbound":2,"ECTdistricteastbound":2,"ECTdistrictwestbound":3,"CTNnorthernnorthbound":2,"CTNnorthernsouthbound":2,"HOHmetropolitannorthbound":2,"NANcentralwestbound":2,"TNGdistrictwestbound":2,"HNXpiccadillywestbound":2,"LYScentraleastbound":2,"RKWmetropolitansouthbound":2,"KNGnorthernnorthbound":2,"CALmetropolitannorthbound":2,"CXYmetropolitansouthbound":3,"MPKmetropolitannorthbound":2,"FYCnorthernnorthbound":2};
            //End Points (naptan-line:platform)
            var terminus = {"ERCdistrict":"westbound","EGWnorthern":"southbound","UXBmetropolitan":"eastbound","UXBpiccadilly":"eastbound","BXNvictoria":"northbound","EACbakerloo":"northbound","HBTnorthern":"southbound","BNKwaterloo-city":"eastbound","WLOwaterloo-city":"westbound","ALDmetropolitan":"northbound","AMSmetropolitan":"southbound","EBYcentral":"eastbound","EBYdistrict":"eastbound","HSChammersmith-city":"northbound","HSCcircle":"northbound","STMjubilee":"southbound","STDjubilee":"westbound","WAFmetropolitan":"southbound","UPMdistrict":"westbound","WIMdistrict":"eastbound","BKGhammersmith-city":"westbound","EPGcentral":"westbound","HR4piccadilly":"westbound","RMDdistrict":"eastbound","CKSpiccadilly":"westbound","HR5piccadilly":"eastbound","HAWbakerloo":"southbound","CSMmetropolitan":"eastbound","WWLvictoria":"southbound","MHLnorthern":"southbound","MDNnorthern":"northbound","WRPcentral":"eastbound","KOYdistrict":"eastbound"};
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
            //From station ID
            var fid = null;
            //Known Time Between Stations
            var tbs = null;
            //Possible Origins Object
            var posObj = stn['line'][lid];

            //Due to occasional incorrect data
            if (!posObj) {
                if (lid === 'hammersmith-city') {
                    posObj = stn['line']['district'];
                } else {
                    return null;
                }
            }

            //Locate the train using it's time to station
            for (var platform in posObj) {
                if (platform !== dot || terminus[sid+lid]) {
                    //Check if it's a junction
                    if (fork[sid+lid+platform]) {
                        break;
                    }
                    var fidObj = posObj[platform];
                    for (var key in fidObj) {
                        fid = key;
                        tbs = fidObj[key];
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
                        break;
                    }
                }
            }

            //Locate the train using Current Location String    
            var cls = train['currentLocation'].replace(/,| depot| sidings| platform.*$|/gi,''); //Remove unwanted words
            //Train is between station id, a and b
            var a = null;
            var b = null;
            switch (cls.substring(0,3)) {
                case 'At ':
                    a = this.stationNameLookup(cls.split('At ')[1]);
                    return {
                        'lat': a['lat'],
                        'lon': a['lon']
                    }
                case 'Bet': //Between
                    cls = cls.substring(8).split(' and ');
                    if (cls.length > 2) cls.splice(1,1); //Elephant and Castle. Remove the middle value - either castle or elephant. Catch in lookup. 
                    a = this.stationNameLookup(cls[0]);
                    b = this.stationNameLookup(cls[1]);
                    ratio = 0.5; //Exact position unknown
                    break;
                case 'Lef': //Left
                case 'Lea': //Left
                case 'Dep': //Departed
                    a = this.stationNameLookup(cls.substring(cls.indexOf(' ')+1));
                    b = sid;
                    ratio = 0.1 //Just Left
                    break;
                case 'App': //Approaching
                case 'Arr': //Arriving
                    b = sid;
                    ratio = 0.9;
                    //Need to find out from where it's coming.
                    var lines = stn['line'][lid];
                    //Some district line trains are mislabelled as hammersmith and city.
                    if (!lines && lid === 'hammersmith-city') {
                        lines = stn['line']['district'];
                    }
                    var platform;
                    for (platform in lines) {
                        if (platform !== dot) {
                            //Train arriving from opposite direction to which it's heading
                            var origins = lines[platform];
                            var origin;
                            for (origin in origins) {
                                a = origin;
                                break;
                            }
                        }
                    }
                    break;
                default:
                    console.log(cls);
            }
            if (a && b && ratio) {
                return this.newLatLon(sObj['sid'][a], sObj['sid'][b], ratio);
            }
            return null;
        },
        getArrivals: function(data) {
            //Convert Location String to a Coordinate!
            var trainMarkers = [];
            var unknown = [];
            var i;
            var dataLength = data.length;
            for (i=0; i<dataLength; i++) {

                var train = data[i];
                var sid = train['naptanId'].substring(8); //Station ID
                var stn = sObj['sid'][sid]; //Station Object
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
                                var coords = this.locateTrain(train);
                                if (coords) {
                                    train['coords'] = coords;
                                } else {
                                    //train['coords'] = this.clsTrainLocate(train);
                                }
                        }
                }
                if (train['coords']) {
                    trainMarkers.push(train);
                } else {
                    unknown.push(train);
                }
            }
            console.log(trainMarkers.length + '/' + data.length);
            console.log(unknown);
            return trainMarkers;
        }
    };
});
tubeApp.controller('MainCtrl', function ($scope, $routeParams, getData, genericServices) {
    
    var data2 = [
        {  
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"590569225",
            "operationType":1,
            "vehicleId":"131",
            "naptanId":"940GZZLUFYC",
            "stationName":"Finchley Central Underground Station",
            "lineId":"northern",
            "lineName":"Northern",
            "platformName":"Southbound - Platform 3",
            "direction":"inbound",
            "destinationNaptanId":"940GZZLUMDN",
            "destinationName":"Morden Underground Station",
            "timestamp":"2015-07-03T15:10:08.123Z",
            "timeToStation":57,
            "currentLocation":"",
            "towards":"Morden via Bank",
            "expectedArrival":"2015-07-03T15:11:05.123Z",
            "timeToLive":"2015-07-03T15:11:05.123Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:278"
        },
        {  
            "$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
            "id":"1960589679",
            "operationType":1,
            "vehicleId":"206",
            "naptanId":"940GZZLUMMT",
            "stationName":"Monument Underground Station",
            "lineId":"district",
            "lineName":"District",
            "platformName":"Westbound - Platform 1",
            "direction":"inbound",
            "destinationNaptanId":"940GZZLUERC",
            "destinationName":"Edgware Road (Circle Line) Underground Station",
            "timestamp":"2015-07-04T15:53:45.043Z",
            "timeToStation":297,
            "currentLocation":"East of Liverpool Street",
            "towards":"Edgware Road (Circle)",
            "expectedArrival":"2015-07-04T15:58:42.043Z",
            "timeToLive":"2015-07-04T15:58:42.043Z",
            "modeName":"tube",
            "coords":false,
            "$$hashKey":"object:402"
        }
    ];
    $scope.stationList = sObj['sid'];
    $scope.station = sObj['sid'][$routeParams.stationId];
    getData.fetch('allArrivals', null, false, function (data) {
        //consolidate the data first
        $scope.arrivals = genericServices.unifyData(data);
        $scope.markers = genericServices.getArrivals($scope.arrivals);

    });
});
