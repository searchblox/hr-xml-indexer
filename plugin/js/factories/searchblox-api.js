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
        s.resumeTextContent = null;
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
                    "meta": [
                        {
                            "_name": "experience",
                            "__text": 0
                        },
                        {
                            "_name": "currentcompany",
                            "__text": ''
                        },
                        {
                            "_name": "previouscompany",
                            "__text": ''
                        },
                        {
                            "_name": "currentlocation",
                            "__text": ''
                        }
                    ]
                }
            }
        };

        protoFn = function(url, method, obj, cb) {
            cb = cb || function() {};
            method = method != null ? method: 'post';
            var config = {};

            config.transformResponse = function(data) {
                s.resumeXML = data;
                s.resumeTextContent = $.trim(data.replace(/(<([^>]+)>)/ig,""));
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

            parseViewValues(format, data);

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
            return x2js.json2xml_str(json)
        };

        var parseViewValues = function(format, data) {
            var r = s.resumeObject.Resume,
                ua = r.UserArea,
                sxr = r.StructuredXMLResume,
                nxr = r.NonXMLResume;

            format.searchblox['_apikey'] = s.licenseKey;
            format.searchblox['document']['_colname'] = s.colName;
            format.searchblox['document']['url'] = 'data/results/' + data.name + '.xml';

            format.searchblox['document']['title']['__text'] = sxr.ContactInfo.PersonName.FormattedName || data.name;
            format.searchblox['document']['content']['__text'] = s.resumeTextContent || '';

            if (sxr.ExecutiveSummary) {
                format.searchblox['document']['description']['__text'] = sxr.ExecutiveSummary || '';
            }

            if (ua.DaxResumeUserArea.AdditionalPersonalData) {
                format.searchblox['document']['meta'][0]['__text'] = ua.DaxResumeUserArea.AdditionalPersonalData.ExperienceSummary.TotalYearsOfWorkExperience;
            }

            if (sxr.EmploymentHistory) {
                var eh = sxr.EmploymentHistory.EmployerOrg, prevCIndex = 0, prevCs = [];

                if (angular.isArray(eh)) {
                    // Current company
                    for (var x = 0; eh.length > x; x++) {
                        var y = eh[x];

                        if (y.EmployerOrgName) {
                            format.searchblox['document']['meta'][1]['__text'] = y.EmployerOrgName;
                            prevCIndex = x;

                            // Current City/Location
                            if (y.EmployerContactInfo && y.EmployerContactInfo.LocationSummary) {
                                var locSummary = y.EmployerContactInfo.LocationSummary, location = '';

                                if (locSummary.Municipality) {
                                    location += locSummary.Municipality;
                                }

                                if (locSummary.Region) {
                                    location += ', ' + locSummary.Region;
                                }

                                if (locSummary.CountryCode) {
                                    location += ', ' + locSummary.CountryCode;
                                }

                                format.searchblox['document']['meta'][3]['__text'] = location.trim(',\\s');
                            }

                            break;
                        }
                    }

                    if (prevCIndex > -1) {
                        format.searchblox['document']['meta'][2]['__text'] = "";
                        // Previous Company
                        for (var i = prevCIndex + 1; eh.length > i; i++) {
                            var j = eh[i];

                            if (j.EmployerOrgName) {
                                prevCs.push(j.EmployerOrgName);
                            }
                        }

                        if (prevCs.length) {
                            format.searchblox['document']['meta'][2]['__text'] = prevCs.join(',');
                        }
                    }
                }
            }

            if (sxr.Competency) {
                var ct = sxr.Competency, keywords;

                if (angular.isArray(ct)) {
                    // Skills
                    keywords = ct.map(function(v) {
                        return v['_name'];
                    }).join(', ');

                    format.searchblox['document']['keywords']['__text'] = keywords;
                }
            }
        };

        return s;
    }]);

})();
