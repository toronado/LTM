'use strict';

/**
 * @ngdoc function
 * @name tubeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the tubeApp
 */
angular.module('tubeApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
