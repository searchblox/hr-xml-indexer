(function() {
    // Top Most Parent CONTROLLER

    'use strict';
    var app = angular.module('searchblox.controller', []);

    app.controller('searchbloxParentController', ['$scope', function ($scope) {
        $scope.ddate = new Date().getFullYear();
    }]);
})();
