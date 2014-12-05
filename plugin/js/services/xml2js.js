(function() {
    'use strict';

    var app = angular.module('xml2js', []);

    app.factory('x2js', function() {
        return new X2JS({
            escapeMode: false
        });
    });

})();
