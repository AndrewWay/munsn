var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
var MAX_TIME = 1000 * 2; //2 seconds
var MAX_TRIES = 5;

module.exports = function (DBSearch, collectionUsers, collectionGroups, collectionCourses) {

    DBSearch.search = function (req, res, callback) {
        var search = req.query.search;
        console.log("[DBSearch] Search", JSON.stringify(search));
        if (search) {
            var query = new RegExp(search, "i");
            var results = {};
            // Declare loop control variables
            var cbUsers = false,
                cbGroups = false,
                cbCourses = false,
                masterBreak = false;
            //Search through users
            collectionUsers.find({
                $or: [{
                    fname: {
                        $regex: query
                    }
                }, {
                    lname: {
                        $regex: query
                    }
                }]
            }).toArray(function (uError, uResults) {
                if (uError) {
                    console.error("[DBSearch] Search->Users", "'" + uError.message + "'->'" + search + "'");
                } else {
                    results.users = uResults;
                    cbUsers = true;
                    console.log("[DBSearch] Search->Users", "'" + (uResults[0] ? "Found Results" : "No Results") + "'->'" + search + "'");
                }
            });
            //Search through groups
            collectionGroups.find({
                name: {
                    $regex: query
                }
            }).toArray(function (gError, gResults) {
                if (gError) {
                    console.error("[DBSearch] Search->Groups", "'" + gError.message + "'->'" + search + "'");

                } else {
                    results.groups = gResults;
                    cbGroups = true;
                    console.log("[DBSearch] Search->Groups", "'" + (gResults[0] ? "Found Results" : "No Results") + "'->'" + search + "'");
                }
            });
            //Search through courses
            collectionCourses.find({
                $or: [{
                    label: {
                        $regex: query
                    }
                }, {
                    name: {
                        $regex: query
                    }
                }]
            }).toArray(function (cError, cResults) {
                if (cError) {
                    console.error("[DBSearch] Search->Courses", "'" + cError.message + "'->'" + search + "'");
                } else {
                    results.courses = cResults;
                    cbCourses = true;
                    console.log("[DBSearch] Search->Courses ", "'" + (cResults[0] ? "Found Results" : "No Results") + "'->'" + search + "'");
                }
            });

            //Start search loop after MAX_SEARCH_TIME seconds
            var count = 1;
            var searchLoop = setInterval(function () {
                console.log("[DBSearch] Search", "Iteration " + count + " of " + MAX_TRIES);
                //If all searches are finish, then break loop, send back data
                if (cbUsers && cbGroups && cbCourses) {
                    console.log("[DBSearch] Search->Finished", "'Found'->'" + JSON.stringify(results) + "'");
                    clearInterval(searchLoop);
                    callback({
                        session: req.session,
                        status: 'ok',
                        data: results
                    });
                } else {
                    //If not, then repeat MAX_SEARCH_TRIES amount
                    if (count < MAX_TRIES) {
                        count++;
                    }
                    //If MAX_SEARCH_TRIES is exceeded, then return whatever search data is complete
                    else {
                        console.log("[DBSearch] Search->Finished", "'Attempts Exceeded'");
                        console.log("[DBSearch] Search->Finished", "'Found'->'" + JSON.stringify(results) + "'");
                        clearInterval(searchLoop);
                        callback({
                            session: req.session,
                            status: 'ok',
                            data: results
                        });
                    }
                }
            }, MAX_TIME);
        } else {
            console.warn("[DBSearch] Search", "'Missing Fields'");
            callback({
                session: req.session,
                status: "fail"
            });
        }
    };

};