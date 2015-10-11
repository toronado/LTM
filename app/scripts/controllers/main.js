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
                case 'sample':
                    var url = 'data/sample.json';
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
            //Train is at or between station id, a and b
            var a = null;
            var b = null;
            switch (cls.substring(0,3)) {
                case 'At ':
                    a = this.stationNameLookup(cls.split('At ')[1]);
                    if (a) {
                        var aid = sObj['sid'][a];
                        return {
                            'lat': aid['lat'],
                            'lon': aid['lon']
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

tubeApp.factory('lineService', function() {
    return {
        paths: {},
        reset: function() {
            this.paths = {};
        },
        drawPath: function(id, points) {
            var linePath = new google.maps.Polyline({
                path: points,
                geodesic: true,
                strokeColor: sObj['lines'][id]['colour'],
                strokeOpacity: 0.7,
                strokeWeight: 1.5
            });
            linePath.setMap(map);
            if (this.paths[id]) {
                this.paths[id].push(linePath);
            } else {
                this.paths[id] = [linePath];
            }
        },
        showOnly: function(lineId) {
            var line;
            for (line in this.paths) {
                if (line !== lineId) {
                    this.visible(line, false);
                } else {
                    this.visible(line, true);
                }
            }
        },
        showAll: function() {
            var line;
            for (line in this.paths) {
                this.visible(line, true);
            }
        },
        visible: function(line, bool) {
            var paths = this.paths[line];
            var i, arrLen;
            arrLen = paths.length;
            for (i=0; i<arrLen; i++) {
                if (bool) {
                    paths[i].setVisible(true);
                } else {
                    paths[i].setVisible(false);
                }
            }
        },
        // Returns all possible routes or paths for a given line
        buildLine: function(pathsOrRoutes, lineId) {
            var lines = sObj['lines'][lineId];
            var stops = lines['stops'];
            var porsA = lines[pathsOrRoutes];
            //Some lines have no forks e.g. jubilee
            if (!porsA) return stops;

            var porsL = porsA.length;
            var rtnPr = [];
            var i, j;

            for (i=0; i<porsL; i++) {
                var porA = porsA[i];
                var porL = porA.length;
                for (j=0; j<porL; j++) {
                    if (rtnPr[i]) {
                        rtnPr[i] = rtnPr[i].concat(stops[porA[j]]);
                    } else {
                        rtnPr[i] = stops[porA[j]];
                    }
                }
            }
            return rtnPr;
        },
        findRoute: function(routes, stations) {
            var i, j, route, routesLen, stationsLen, routeFound, indexArr;
            routesLen = routes.length;
            stationsLen = stations.length;
            for (i=0; i<routesLen; i++) {
                route = routes[i];
                indexArr = [];
                for (j=0; j<stationsLen; j++) {
                    var station = stations[j];
                    var index = route.indexOf(station);
                    if (index === -1) {
                        indexArr = [];
                        break;
                    }
                    indexArr.push(index);
                    if (indexArr.length === stationsLen) {
                        return indexArr;
                    }
                }
            }
            return false;
        },
        onRoute: function(a, b, c) {
            if (a > b) {
                if (c <= a && c >= b) {
                    return true;
                }
            } else {
                if (c <= b && c >= a) {
                    return true;
                }
            }
            return false;
        }
    }
});

tubeApp.factory('markerService', function() {
    return {
        markers: {},
        addMove: function (mObj) {
            if (this.markers[mObj['id']]) {
                //Marker exists so prepare to move it
                var marker = this.markers[mObj['id']];
                //Avoid unnecessary marker movements by assuming new position will never be a perfect longitudinal straight line
                if (mObj['lon'] !== marker['lon']) {
                    var position = new google.maps.LatLng(mObj['lat'], mObj['lon']);
                    //Using markerAnimate plugin
                    marker['markerObj'].animateTo(position, {easing: 'linear', duration: 10000});
                    //Update info window
                    if (mObj['info']) {
                        marker['infoObj'].setContent(mObj['info']['content']);
                    }
                }
                //Update timestamp
                if (mObj['timestamp']){
                    marker['timestamp'] = mObj['timestamp'];
                }
            } else {
                //Place marker and store as markerObj
                mObj['markerObj'] = new google.maps.Marker({
                    position: new google.maps.LatLng(mObj['lat'], mObj['lon']),
                    icon: mObj['icon'],
                    zIndex: mObj['icon']['zIndex'],
                    map: map
                });
                //Add an infowindow and store as infoObj
                if (mObj['info']) {
                    mObj['infoObj'] = this.infoWindow(mObj['info'], mObj['markerObj']);
                }
                //Add marker to markers object for tracking puroposes
                this.markers[mObj['id']] = mObj;
            }
        },
        infoWindow: function (iObj, marker) {
            var infowindow = new google.maps.InfoWindow({
                maxWidth: 300,
                content: iObj['content']
            });
            google.maps.event.addListener(marker, 'mouseover', function () {
                infowindow.open(map,marker);
            });
            google.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close(map,marker);
            });
            /*google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(map,marker);
            });*/
            if (iObj['clickback']) {
                google.maps.event.addListener(marker, 'click', function () {
                    iObj.clickback();
                });
            }
            //return infowindow object so it can be updated
            return infowindow;
        },
        removeOld: function (timestamp) {
            var m, marker;
            for (m in this.markers) {
                marker = this.markers[m];
                if (marker['timestamp']) {
                    if (marker['timestamp'] !== timestamp) {
                        marker['markerObj'].setMap(null);
                        delete this.markers[m];
                    }
                }
            }
        },
        showOnly: function (lineId) {
            //Show hide dependant on line id
            var markers = this.markers;
            var marker, mid, m;
            for (marker in markers) {
                m = markers[marker];
                mid = m['id'];
                if (mid === 'center') continue;
                if (lineId === '' || mid.substring(0,2) === lineId.substring(0,2)) {
                    m['markerObj'].setVisible(true);
                } else {
                    m['markerObj'].setVisible(false);
                }
            }
        },
        showAll: function() {
            var marker;
            for (marker in this.markers) {
                this.markers[marker]['markerObj'].setVisible(true);
            }
        },
        showHideInfo: function(mid) {
            var m = this.markers[mid];
            if (!m) return;
            var io = m['infoObj'];
            if (io.getMap()) {
                io.close(map, m['markerObj']);
            } else {
                io.open(map, m['markerObj']);
            }
        },
        reset: function() {
            this.markers = {};
        }
    }
});

tubeApp.controller('MainCtrl', function ($scope, $routeParams, $timeout, dataFactory, dataService, markerService, lineService) {

    markerService.reset();
    lineService.reset();

    $scope.live = 1;
    $scope.visible = 1;
    $scope.stationId = $routeParams.stationId;
    $scope.stations = sObj['sid'];
    $scope.station = $scope.stations[$routeParams.stationId];
    $scope.paths = Object.keys($scope.station['line']);
    $scope.activeTab = null;
    $scope.lineFilter = {
        lineId: '',
        set: function (line, index) {
            if (line === this.lineId) {
                lineService.showAll();
                markerService.showAll();
                $scope.activeTab = null;
                this.lineId = '';
            } else {
                this.lineId = line;
                lineService.showOnly(this.lineId);
                markerService.showOnly(this.lineId);
                $scope.activeTab = index;
            }
        }
    }
    $scope.go = function() {
        dataFactory.getArrivals('line', $routeParams.stationId).then(function (data) {
            $scope.ajax = 0;
            $scope.timestamp = new Date().getTime() / 1000;
            $scope.arrivals = data;
            $scope.trains = dataService.unifyData(data);
        });
    }

    var stations = [];
    var station;
    for (station in $scope.stations) {
        stations.push({
            'id': station,
            'name': $scope.stations[station]['name']
        });
    }
    $scope.stationList = stations;
    $scope.popInfo = function(arrival) {
        var mid = arrival.lineId.substring(0,2)+arrival.vehicleId;
        markerService.showHideInfo(mid);
    }

    var counter;
    var cd = {
        count: 0,
        start: function() {
            if (!cd.count) {
                $scope.ajax = 1;
                $scope.go();
                cd.count = 50;
            }
            $scope.count = cd.count;
            cd.count--;
            counter = $timeout(cd.start, 1000);
        },
        stop: function() {
            $timeout.cancel(counter);
            cd.count = 0;
        }
    }
    cd.start();

    $scope.toggleLive = function() {
        $scope.live = 1 - $scope.live;
        if ($scope.live) {
            cd.start();
        } else {
            cd.stop();
        }
    }
    $scope.$on("$destroy",function (event) { 
        cd.stop();
    });

    $scope.toggleVisible = function() {
        $scope.visible = 1 - $scope.visible;
    }
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