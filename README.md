hr-xml-indexer
==============

#### Utility to index HR-XML compliant xml files into SearchBlox for Faceted Search


- Download the plugin folder into the SearchBlox installation under /searchblox to use the package. 
- Access the angularJS based search page at http://localhost:8080/searchblox/plugin/index.html
- Edit the /plugin/data/facet.json file to add/modify/remove term, number range and date range filters.
- Add sorting options and faceted search options on the facet.json file. 

Facet.json configuration file options that can be configured.
    
    "licenseKey": "F7F522D18E3D1F47947D31D1E3C32093", // API Key used for indexing. REQUIRED
    
    "colName": "Resume-Collection",                   // Collection name to index. REQUIRED
    
    "resumeCandidates": [   // list down all the xml files, place all the xml files in this
        "Abhik",            // plugin "plugin/data/results/" directory
        "AkshataKothiwale",
        "AlexSpears201405cProfileBA",
    ]
    
    "facets":[
        {"field": "contenttype", "display": "Content Type","size":"10"}, // term facet filters
        {"field": "keywords",  "display": "Keywords","size":"10"}, 
        {"field": "colname","display": "Collection","size":"10"},
        {"field": // number range facet filters
            "size","display":"Size",
            "slider": true, // true/false to enable/disable slider filter
            "range":[
            {"name":"&lt 100kB","from":"*","to":"102400"}, // define the from and to values to setup a range
            {"name":"100kB to 500kB","from":"102400","to":"512000"}, 
            {"name":"500kB to 1MB","from":"512000","to":"1048576"},
            {"name":"1MB to 10MB","from":"1048576","to":"10485760"},
            {"name":"10MB &gt","from":"10485760","to":"*"} // * can be used to define the higher or lower ranges
        ]},
        {"field": "lastmodified","display":"Modified Date", // date range facet filters
            "dateRange":[ 
                {"name":"Last 24 hours","calendar":"days","value":"1"}, // look back values can be specified in days, months, years within the calendar
                {"name":"Past Week","calendar":"days","value":"7"},
                {"name":"Past Month","calendar":"months","value":"1"},
                {"name":"Past Year","calendar":"years","value":"1"}
            ]}
    ],
    
    "collection":[], // Use collection id or list of collection ids comma separated to limit the Collections to be searched from the form field
    
    "collectionForAds":[], // Use collection id or list of collection ids comma separated to limit the Featured Results to be shown to just the specified collections instead of displaying the Featured Results to all collections
    
    "sortBtns":[ // Sort buttons for any field can be added here to display at the top of the results.
		{"field":"alpha","display":"Alphabetic"},
		{"field":"date","display":"Date"},
		{"field":"relevance","display":"Relevance"}
    ],
    
    "matchAny":"off", // Match any terms "off" or "on". Default is match all terms
    
    "sortDir":"desc", // sorting direction asc or desc for ascending or descending order
    
    "pageSize": "10", // Number of results per page
    
    "showAutoSuggest": "true" // turn off autosuggest by setting this value to false

And ofcourse you need to append this to `searchblox/webapps/searchblox/WEB-INF` inside the `sdoc.properties`

    "experience":{
        "type":"integer",
        "store":"yes",
        "include_in_all":"false"
    },
    "currentcompany":{
        "type":"string",
        "store":"yes",
        "include_in_all":"false"
    },