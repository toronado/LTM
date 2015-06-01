'use strict';

/**
 * @ngdoc overview
 * @name tubeApp
 * @description
 * # tubeApp
 *
 * Main module of the application.
 */
var tubeApp = angular.module('tubeApp', ['ngRoute', 'uiGmapgoogle-maps']);

tubeApp.config(function ($routeProvider) {
    $routeProvider
        .when('/:stationId/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .otherwise({
            templateUrl: 'views/about.html',
            controller: 'AboutCtrl'
        });
});
