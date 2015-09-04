/*var count = 1;
var data1 = [{"$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities","id":"-1230210341","operationType":1,"vehicleId":"026","naptanId":"940GZZLUBND","stationName":"Bond Street Underground Station","lineId":"central","lineName":"Central","platformName":"Eastbound - Platform 2","direction":"outbound","destinationNaptanId":"940GZZLUEPG","destinationName":"Epping Underground Station","timestamp":"2015-09-04T09:49:11.977Z","timeToStation":418,"currentLocation":"At Notting Hill Gate","towards":"Epping","expectedArrival":"2015-09-04T09:56:09.977Z","timeToLive":"2015-09-04T09:56:09.977Z","modeName":"tube"},{"$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities","id":"334938528","operationType":1,"vehicleId":"066","naptanId":"940GZZLUBKE","stationName":"Barkingside Underground Station","lineId":"central","lineName":"Central","platformName":"Inner Rail - Platform 2","direction":"outbound","destinationNaptanId":"940GZZLUHLT","destinationName":"Hainault Underground Station","timestamp":"2015-09-04T09:49:11.68Z","timeToStation":298,"currentLocation":"Between Redbridge and Gants Hill","towards":"Hainault via Newbury Park","expectedArrival":"2015-09-04T09:54:09.68Z","timeToLive":"2015-09-04T09:54:09.68Z","modeName":"tube"},{"$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities","id":"-1019785503","operationType":1,"vehicleId":"113","naptanId":"940GZZLULYN","stationName":"Leyton Underground Station","lineId":"central","lineName":"Central","platformName":"Eastbound - Platform 2","direction":"inbound","destinationNaptanId":"940GZZLULVT","destinationName":"Liverpool Street Underground Station","timestamp":"2015-09-04T09:49:13.383Z","timeToStation":267,"currentLocation":"Between Mile End and Stratford","towards":"Loughton","expectedArrival":"2015-09-04T09:53:40.383Z","timeToLive":"2015-09-04T09:53:40.383Z","modeName":"tube"}];
var data2 = [{"$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities","id":"-1230210341","operationType":1,"vehicleId":"026","naptanId":"940GZZLUBND","stationName":"Bond Street Underground Station","lineId":"central","lineName":"Central","platformName":"Eastbound - Platform 2","direction":"outbound","destinationNaptanId":"940GZZLUEPG","destinationName":"Epping Underground Station","timestamp":"2015-09-04T09:49:11.977Z","timeToStation":418,"currentLocation":"At Notting Hill Gate","towards":"Epping","expectedArrival":"2015-09-04T09:56:09.977Z","timeToLive":"2015-09-04T09:56:09.977Z","modeName":"tube"},{"$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities","id":"334938528","operationType":1,"vehicleId":"066","naptanId":"940GZZLUBKE","stationName":"Barkingside Underground Station","lineId":"central","lineName":"Central","platformName":"Inner Rail - Platform 2","direction":"outbound","destinationNaptanId":"940GZZLUHLT","destinationName":"Hainault Underground Station","timestamp":"2015-09-04T09:49:11.68Z","timeToStation":298,"currentLocation":"Between Redbridge and Gants Hill","towards":"Hainault via Newbury Park","expectedArrival":"2015-09-04T09:54:09.68Z","timeToLive":"2015-09-04T09:54:09.68Z","modeName":"tube"}];
var data3 = [{"$type":"Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities","id":"-1230210341","operationType":1,"vehicleId":"026","naptanId":"940GZZLUBND","stationName":"Bond Street Underground Station","lineId":"central","lineName":"Central","platformName":"Eastbound - Platform 2","direction":"outbound","destinationNaptanId":"940GZZLUEPG","destinationName":"Epping Underground Station","timestamp":"2015-09-04T09:49:11.977Z","timeToStation":418,"currentLocation":"At Notting Hill Gate","towards":"Epping","expectedArrival":"2015-09-04T09:56:09.977Z","timeToLive":"2015-09-04T09:56:09.977Z","modeName":"tube"}];
*/
$scope.stationId = $routeParams.stationId;
$scope.station = sObj['sid'][$routeParams.stationId];
//$scope.lines = sObj['paths']['central'];
$scope.paths = Object.keys($scope.station['line']);
$scope.go = function() {
    //dataFactory.getArrivals('line', $routeParams.stationId).then(function (data) {
        switch (count) {
            case 1:
                var data = data1;
                break;
            case 2:
                var data = data2;
                break;
            case 3:
                var data = data3;
                break;
        }
        $scope.timestamp = new Date().getTime() / 1000;
        $scope.arrivals = data;
        $scope.trains = dataService.unifyData(data);
    //});
    count++;
}
$scope.go();