(function() {
    'use strict';

    var API_URL = '/searchblox/api/rest',
        API_INDEX_URL = API_URL + '/add';

    var app = angular.module('searchblox.api', []);

    app.factory('searchbloxAPI', ['$http', 'x2js', '$q',
    function ($http, x2js, $q) {
        var protoFn, s;

        s = {};

        s.licenseKey = null;
        s.colName = null;

        s.resumeObject = null;
        s.resumeXML = null;
        s.resumeCandidates = [];

        var sampleFormat = {
            "searchblox": {
                "_apikey": "F7F522D18E3D1F47947D31D1E3C32093",
                "document": {
                    "_colname": "Custom_Collection",
                    "_location": "http://www.google.com/",
                    "url": "",
                    "title": {
                        "_boost": "1",
                        "__text": ""
                    },
                    "keywords": {
                        "_boost": "1",
                        "__text": ""
                    },
                    "content": {
                        "_boost": "1",
                        "__text": ""
                    },
                    "description": {
                        "_boost": "1",
                        "__text": ""
                    },
                    "category": [
                        "Resumes"
                    ],
                    "meta": [{
                        "_name": "experience",
                        "__text": 0
                    },{
                        "_name": "currentcompany",
                        "__text": ''
                    }, {
                        "_name": "previouscompany",
                        "__text": ''
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

        s.indexResume = function(data, cb) {
            var format = sampleFormat;

            if (!s.resumeObject || !s.resumeObject.Resume) {
                return;
            }

            var r = s.resumeObject.Resume,
                ua = r.UserArea,
                sxr = r.StructuredXMLResume,
                nxr = r.NonXMLResume;

            format.searchblox['_apikey'] = s.licenseKey;
            format.searchblox['document']['_colname'] = s.colName;
            format.searchblox['document']['url'] = 'data/results/' + data.name + '.xml';

            format.searchblox['document']['title']['__text'] = sxr.ContactInfo.PersonName.FormattedName || data.name;

            if (ua.DaxResumeUserArea.AdditionalPersonalData) {
                format.searchblox['document']['meta'][0] = ua.DaxResumeUserArea.AdditionalPersonalData.ExperienceSummary.TotalYearsOfWorkExperience;
            }

            //format.searchblox['document']['meta'][1] = r;
            //format.searchblox['document']['meta'][2] = r;

            return protoFn(API_INDEX_URL, null, format, cb);
        };

        s.getResume = function(name, cb) {
            if (!name) return;

            name = name + '.xml';

            return protoFn('data/results/' + name, 'get', {}, function(err, res) {
                s.resumeObject = res.data;
                cb.apply(this, arguments);
            });
        };

        s.indexResumes = function(eachCB, finalCB) {
            var rc = s.resumeCandidates;

            if (rc && angular.isArray(rc)) {
                async.eachSeries(rc, function(v, cb) {

                    s.getResume(v, function(err) {
                        if (err) return cb(null);
                        eachCB(v);

                    }).then(function() {
                        s.indexResume({
                            name: v
                        }, function() {
                            cb(null, v);
                        });
                    });

                }, function() {
                    finalCB();
                });
            }
        };

        s.toXML = function(json) {
            console.log(json);
            return x2js.json2xml_str(json)
        };

        return s;
    }]);

})();
