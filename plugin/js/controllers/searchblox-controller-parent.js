(function() {
    // Top Most Parent CONTROLLER

    'use strict';
    var app = angular.module('searchblox.controller', []);

    app.controller('searchbloxParentController', ['$scope', 'searchbloxAPI', function ($scope, searchbloxAPI) {
        $scope.ddate = new Date().getFullYear();

        $scope.API = {
            indexing: false,
            indexFinished: false,
            currentDocument: ''
        };

        $scope.doIndexing = function() {
            if (!searchbloxAPI.licenseKey) {
                return alert('License key is invalid');
            }

            $scope.API.indexFinished = false;
            $scope.API.indexing = true;

            var _eachCallback = function (v) {
                $scope.API.currentDocument = v;
            };

            var _finalCallback = function () {
                $scope.API.indexing = false;
                $scope.API.indexFinished = true;
                console.log('done');
            };

            searchbloxAPI.indexResumes(_eachCallback, _finalCallback);
        };

    }]);
})();
