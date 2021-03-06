'use strict';

/**
 * @ngdoc overview
 * @name tubeApp
 * @description
 * # tubeApp
 *
 * Main module of the application.
 */
var tubeApp = angular.module('tubeApp', [
		'ngRoute',
		'app.directives.googleMap',
        'app.directives.googlePath',
        'app.directives.googleMarker'
	]);

tubeApp.config(function ($routeProvider) {
    $routeProvider
        .when('/:stationId/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .otherwise({
            templateUrl: 'views/index.html',
            controller: 'IndexCtrl'
        });
});
