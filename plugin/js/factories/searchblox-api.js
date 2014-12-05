(function() {
    'use strict';

    var API_URL = '/searchblox/api/rest',
        API_INDEX_URL = API_URL + '/add';

    var app = angular.module('searchblox.api', []);

    app.factory('searchbloxAPI', ['$http', 'x2js',
    function ($http, x2js) {

        var protoFn, s;

        s = {};

        s.resumeObject = null;
        s.resumeXML = null;
        s.licenseKey = null;
        s.colName = null;
        s.colID = null;

        var sampleFormat = {
            "searchblox": {
                "_apikey": "F7F522D18E3D1F47947D31D1E3C32093",
                "document": {
                    "_colname": "Custom_Collection",
                    "_location": "http://localhost/searchblox/plugin/resume-search/plugin/data/results/Abhik.xml",
                    "url": "http://localhost:8080/searchblox/plugin/resume-search/plugin/data/results/Abhik.xml",
                    "title": {
                        "_boost": "1",
                        "__text": "SearchBlox Product Features"
                    },
                    "keywords": {
                        "_boost": "1",
                        "__text": "SearchBlox, Faceted Search, Features"
                    },
                    "content": {
                        "_boost": "1",
                        "__text": "This content overrides the content from the document."
                    },
                    "description": {
                        "_boost": "1",
                        "__text": "SearchBlox Content Search Features"
                    },
                    "category": [
                        "SearchBlox/Features",
                        "SearchBlox/Product"
                    ],
                    "meta": [{
                        "_name": "experience",
                        "__text": 9
                    },{
                        "_name": "currentcompany",
                        "__text": 9
                    }, {
                        "_name": "previouscompany",
                        "__text": 9
                    }]
                }
            }
        };

        protoFn = function(url, method, obj, cb) {
            cb = cb || function() {};
            method = method != null ? method: 'post';
            var config = {};

            config.transformResponse = function(data) {
                s.resumeXML = data;
                return x2js.xml_str2json(data);
            };

            if (method === 'post') {
                config.transformRequest = function(data) {
                    data = x2js.json2xml_str(data);
                    return data;
                };

                config.headers = {
                    'Content-Type': 'text/plain;charset=UTF-8'
                };
            } else if (method === 'get') {
                obj = config;
            }

            return $http[method](url, obj, config)
            .then(function(res) {
                cb(false, res);
            })['catch'](function(err) {
                cb(true, err);
            });
        };

        s['index'] = function(data, cb) {
            var format = sampleFormat;
            format.searchblox['_apikey'] = s.licenseKey;
            format.searchblox['document']['_colname'] = s.colName;

            jQuery.extend(true, format, data);

            return protoFn(API_INDEX_URL, null, format, cb);
        };

        s.resume = function(name, cb) {
            if (!name) return;

            return protoFn('data/results/' + name + '.xml', 'get', {}, cb);
        };

        s.toXML = function(json) {
            console.log(json);
            return x2js.json2xml_str(json)
        };

        return s;
    }]);

})();
