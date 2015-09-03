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
tubeApp.factory('dataFactory', function ($http) {
    return {
        getArrivals : function(url, params) {
            switch (url) {
                case 'station':
                    var url = 'https://api.tfl.gov.uk/StopPoint/%7Bids%7D/Arrivals';
                    var params = { 'ids': '940GZZLU' + params };
                    break;
                case 'line':
                    var url = 'https://api.tfl.gov.uk/Line/%7Bids%7D/Arrivals';
                    var params = { 'ids': Object.keys(sObj['sid'][params]['line']).join() };
                    break;
            }
            return $http({
                    method: 'GET',
                    url: url,
                    params: params,
                    cache: false
                })
                .then(function (response) {
                    return response.data;
                });
        }
    };
});

tubeApp.factory('dataService', function () {
    return {
        unifyData: function(data) {
            //TFL data contains multiple instances of the same train
            //Need to consolidate the data to the nearest station using 'timeToStation'
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
            //Put data back into array of objects - $hashkey issue if not?? 
            for (train in trainsObj) {
                trainsObj[train]['uid'] = train;
                trainsArr.push(trainsObj[train]);
            }
            return trainsArr;
        }
    };
});

tubeApp.factory('locationService', function () {
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
        locateTrain: function(train) {

            //Station ID - time to station is relative to this station
            var sid = train['naptanId'].substring(8);
            //Station Object
            var stn = sObj['sid'][sid];
            //Time To Station
            var tts = train['timeToStation'];
            //Train is at a Platform tts = 0
            if (!tts) {
                train['currentLocation'] = 'At ' + stn['name'];
                return {
                    'lat': stn['lat'],
                    'lon': stn['lon']
                };
            }
            //Line ID
            var lid = train['lineId'];
            //Direction Of Travel
            var dot = train['platformName'].split(' ')[0].toLowerCase(); //(N)orth/(E)ast/(S)outh/(W)est/(I)nner/(O)uter
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
                if (platform !== dot || sObj['terminus'][sid+lid]) {
                    //Check if it's a junction
                    if (sObj['fork'][sid+lid+platform]) {
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
                    if (a) {
                        return {
                            'lat': a['lat'],
                            'lon': a['lon']
                        }
                    }
                case 'Bet': //Between
                    cls = cls.substring(8).split(' and ');
                    if (cls.length > 2) cls.splice(1,1); //Elephant and Castle. Remove the middle value - either castle or elephant. Catch in lookup. 
                    a = this.stationNameLookup(cls[0]);
                    b = this.stationNameLookup(cls[1]);
                    ratio = 0.5; //Exact position unknown
                    break;
                case 'Lef': //Left
                case 'Lea': //Leaving
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
                        if (platform !== dot) { //Train arrives from opposite direction to which it's heading
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
        }
    };
});

tubeApp.factory('markerService', function() {
    return {
        markers: {},
        get: function() {
            return this.markers;
        },
        addMove: function (mObj) {
            if (this.markers[mObj['id']]) {
                //move marker
                var marker = this.markers[mObj['id']];
                if (mObj['lon'] !== marker['lon']) {
                    var position = new google.maps.LatLng(mObj['lat'], mObj['lon']);
                    marker['markerObj'].animateTo(position, {easing: 'linear',duration: 5000});
                    if (mObj['info']) {
                        marker['infoObj'].setContent(mObj['info']['content']);
                    }
                }
                if (mObj['timestamp']){
                    marker['timestamp'] = mObj['timestamp'];
                }
            } else {
                //add marker
                var icon = {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillOpacity: 1,
                    strokeWeight:0,
                    scale: mObj['scale'],
                    fillColor: mObj['color'],
                };
                mObj['markerObj'] = new google.maps.Marker({
                    position: new google.maps.LatLng(mObj['lat'], mObj['lon']),
                    icon: icon,
                    map: map
                });
                if (mObj['info']) {
                    mObj['infoObj'] = this.infoWindow(mObj['info'], mObj['markerObj']);
                }
                this.markers[mObj['id']] = mObj;
            }
        },
        infoWindow: function (iObj, marker) {
            var infowindow = new google.maps.InfoWindow({
                maxWidth: 200,
                content: iObj['content']
            });
            if (iObj['ux'] === 'hover') {
                google.maps.event.addListener(marker, 'mouseover', function () {
                    infowindow.open(map,marker);
                });
                google.maps.event.addListener(marker, 'mouseout', function () {
                    infowindow.close(map,marker);
                });
            }
            return infowindow;
        },
        remove: function (id) {
            console.log(id);
            this.markers[id]['markerObj'].setMap(null);
            //console.log(this.markers[id]);
            delete this.markers[id];
            //console.log(this.markers);
        },
        removeOld: function (timestamp) {
            var marker;
            for (marker in this.markers) {
                if (marker['timestamp']) {
                    if (marker['timestamp'] !== timestamp) {
                        console.log(marker);
                        marker['markerObj'].setMap(null);
                        delete this.markers[marker];
                    }
                }
                /*var mtimestamp = this.markers[marker]['timestamp'];
                if (!mtimestamp) continue;
                if (mtimestamp !== timestamp) {
                    //this.remove(marker);
                    this.markers[marker].setMap(null);
                }*/
            }
            console.log(this.markers);
        },
        hide: function (id) {
            markers[id]['markerObj'].setVisible(false);
        },
        show: function (id) {
            markers[id]['markerObj'].setVisible(true);
        }
    }
});

tubeApp.controller('MainCtrl', function ($scope, $routeParams, dataFactory, dataService) {

    $scope.stationId = $routeParams.stationId;
    $scope.station = sObj['sid'][$routeParams.stationId];
    //$scope.lines = sObj['paths']['central'];
    $scope.paths = Object.keys($scope.station['line']);
    $scope.go = function() {
        dataFactory.getArrivals('line', $routeParams.stationId).then(function (data) {
            $scope.timestamp = new Date().getTime() / 1000;
            $scope.arrivals = data;
            $scope.trains = dataService.unifyData(data);
        });
    }
    $scope.go();
    /*gogo();
    var myVar = setInterval(function () {gogo()}, 60000);
    $scope.go = function() {
        window.clearInterval(myVar);
        alert('interval cleared');
    }*/
});
//Change seconds to minutes
tubeApp.filter('convertTime', function () {
    return function (input) {
        if (input < 10) {
            return 'Now';
        }
        if (input < 60) {
            return input + 's';
        }
        return Math.floor(input / 60) + ' min';
    };
});