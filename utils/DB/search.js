var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBSearch, collectionUsers, collectionGroups, collectionCourses) {
    
    DBSearch.search = function(req, res, callback) {
        if (req.body.query) {
            var query = req.body.query;
            var searchResults = [];
            // Declare loop control variables
            var cbUsers = false, cbGroups = false, cbCourses = false, masterBreak = false;
            //Search through users
            collectionUsers.find().toArray(function(err, resultsUsers) {
                if (err) {
                    console.error("[DBPosts] Add->'" + post.type + "'", err.message);
                }
            });
            //Search through groups
            collectionGroups.find().toArray(function(err, resultsGroups) {
                if (err) {
                    console.error("[DBPosts] Add->'" + post.type + "'", err.message);
                } 
            });
            //Search through courses
            collectionCourses.find().toArray(function(err, resultsCourses) {
                if (err) {
                    console.error("[DBPosts] Add->'" + post.type + "'", err.message);
                }
            });
            while((!cbUsers && !cbGroups && !cbCourses) || !masterBreak) {

            }
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