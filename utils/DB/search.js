var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
var MAX_SEARCH_TIME = 1000 * 2; //2 seconds
var MAX_SEARCH_TRIES = 5;

module.exports = function (DBSearch, collectionUsers, collectionGroups, collectionCourses) {
    
    DBSearch.search = function(req, res, callback) {
        if (req.query.query) {
            var query = new RegExp(req.query.query, "i");
            var searchResults = {};
            // Declare loop control variables
            var cbUsers = false, cbGroups = false, cbCourses = false, masterBreak = false;
            //Search through users
            collectionUsers.find({$or: [{fname: {$regex: query}}, {lname: {$regex: query}}]}).toArray(function(err, resultsUsers) {
                if (err) {
                    console.error("[DBSearch] Search:Users -> " + req.body.query, err.message);
                }
                else {
                    searchResults.users = resultsUsers;
                    cbUsers = true;
                    console.log("[DBSearch] Search:Users -> " + req.body.query, resultsUsers[0] ? "Found Results": "No results");
                }
            });
            //Search through groups
            collectionGroups.find({name: {$regex: query}}).toArray(function(err, resultsGroups) {
                if (err) {
                    console.error("[DBSearch] Search:Groups -> " + req.body.query, err.message);
                    
                } 
                else {
                    searchResults.groups = resultsGroups;
                    cbGroups = true;
                    console.log("[DBSearch] Search:Groups -> " + req.body.query, resultsGroups[0] ? "Found Results": "No results");
                }
            });
            //Search through courses
            collectionCourses.find({$or: [{label: {$regex: query}}, {name: {$regex: query}}]}).toArray(function(err, resultsCourses) {
                if (err) {
                    console.error("[DBSearch] Search:Courses -> " + req.body.query, err.message);
                }
                else {
                    searchResults.courses = resultsCourses;
                    cbCourses = true;
                    console.log("[DBSearch] Search:Courses -> " + req.body.query, resultsCourses[0] ? "Found Results": "No results");
                }
            });

            //Start search loop after MAX_SEARCH_TIME seconds
            var searchLoopCount = 1;
            var searchLoop = setInterval(function() {
                console.log("[DBSearch] Search Loop", "Started search iteration " + searchLoopCount + " out of " + MAX_SEARCH_TRIES);
                //If all searches are finish, then break loop, send back data
                if (cbUsers && cbGroups && cbCourses) {
                    console.log("[DBSearch] Search Loop", "All collections searched!");
                    console.log("[DBSearch] Search Loop", "Search data: " + JSON.stringify(searchResults));             
                    clearInterval(searchLoop);
                    callback({
                        session: req.session,
                        status: 'ok',
                        data: searchResults
                    });
                }
                else {
                    //If not, then repeat MAX_SEARCH_TRIES amount
                    if (searchLoopCount < MAX_SEARCH_TRIES) {
                        searchLoopCount++;
                    }
                    //If MAX_SEARCH_TRIES is exceeded, then return whatever search data is complete
                    else {
                        console.log("[DBSearch] Search Loop", "Max search attempts exceeded, returning partial data");
                        console.log("[DBSearch] Search Loop", "Search data: " + JSON.stringify(searchResults));                 
                        clearInterval(searchLoop);
                        callback({
                            session: req.session,
                            status: 'ok',
                            data: searchResults
                        });
                    }
                }
            }, MAX_SEARCH_TIME);
        }
        else {
            console.warn("[DBSearch] search", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
        }
    };

};