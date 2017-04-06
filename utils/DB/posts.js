var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBPosts, collectionPosts, collectionFriends) {

	//POST DATA
	//=====================================================================================================================================

	//Add a post
	DBPosts.add = function (req, res, callback) {
		var date = new Date();
		if (req.body.uid) {
			/**
			 * Keys in req.body.fields have the following data if exists
			 *
			 * Image: true/false
			 * Text: string
			 * location: object {x: decimal, y: decimal}
			 * poll: object {options...}
			 */
			req.body.fields.image = req.body.fields.image === "true";
			var post = {
				uid: undefined, //The User who made this post
				type: undefined, //The type of post this is
				targetid: undefined, //The target of this post, Group, Timeline, undefined for lostfound
				visibility: undefined, //public, friends, private
				whitelist: undefined //Override visibility, as a whitelist
			};
			// Loop through body, if field is not found, then set null
			Object.keys(post).forEach(k => {
				if (req.body[k] == undefined) {
					delete post[k];
				} else {
					post[k] = req.body[k];
				}
			});

			//Push the postObject to post.history array
			post.history = [Object.assign({
				date: date
			}, req.body.fields)];
			post.visibility = post.visibility || 'public';
			//Push allowed users to post.allowedUsers array if the visibility is specific

			console.log("[DBPosts] Add->'" + post.type + "'", "'" + JSON.stringify(post) + "'");
			collectionPosts.insert(post, function (err, result) {
				if (err) {
					console.error("[DBPosts] Add->'" + post.type + "'", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					callback({
						session: req.session,
						data: post,
						status: 'ok'
					});
				}
			});

		} else {
			console.warn("[DBPosts] Add", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Remove a post by id
	DBPosts.remove = function (req, res, callback) {
		console.log("[DBPosts] Remove", "'" + req.body.pid + "'");
		collectionPosts.remove({
			_id: new ObjectID(req.body.pid)
		}, function (err, result) {
			if (err) {
				console.error("[DBPosts] Remove", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok'
				});
			}
		});
	};

	//Get posts per user
	DBPosts.findByUserId = function (req, res, callback) {
		console.log("[DBPosts] FindByUID", "'" + req.UserID + "'");
		collectionPosts.find({
			uid: req.UserID
		}).toArray(function (err, result) {
			if (err) {
				console.error("[DBPosts] FindByUID", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok',
					data: result
				});
			}
		});
	};

	//Get posts per post id
	DBPosts.find = function (req, res, callback) {
		var query = req.query;
		Object.assign(query, req.body);
		if (query.pid) {
			query._id = new ObjectID(query.pid);
		}
		if (query.type === "group") {
			query.targetid = new ObjectID(query.targetid);
		}
		console.log("[DBPosts] Find", "'" + JSON.stringify(query) + "'");
		collectionPosts.find(query).toArray(function (err, result) {
			if (err) {
				console.error("[DBPosts] Find", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok',
					data: result
				});
			}
		});
	};

	DBPosts.findTimeline = function (req, res, callback) {
		Object.assign(req.body, req.query);
		console.log("[DBPosts] FindTimeline", JSON.stringify(req.body.uid));
		if (req.body.uid) {
			var results = {};
			// Declare loop control variables
			var cbPublic = false,
				cbPrivate = false,
				cbFriends = false,
				cbList = false;
			var MAX_TIME = 1000 * 0.2,
				MAX_TRIES = 5;
			var queryPublic = {
				visibility: 'public'
			};
			var queryPrivate = {
				visibility: 'private',
				uid: req.body.uid
			};
			var queryFriends = {
				visibility: 'friends'
			};
			var queryList = {
				visibility: 'list'
			};
			//Modify queries if targetid is given
			if (req.body.targetid) {
				queryPrivate.targetid = req.body.targetid;
			}
			collectionPosts.find(queryPublic).toArray(function (pubErr, pubResults) {
				if (pubErr) {
					console.error("[DBPosts] FindTimeline->Public", "'" + pubErr.message + "'->'" + search + "'");
				} else {
					results = results.concat(pubResults);
					cbPublic = true;
					console.log("[DBPosts] FindTimeline->Public", "'" + (pubResults[0] ? "Found Results" : "No Results"));
				}
			});
			collectionPosts.find(queryPrivate).toArray(function (priErr, priResults) {
				if (priErr) {
					console.error("[DBPosts] FindTimeline->Private", "'" + priErr.message + "'->'" + search + "'");

				} else {
					results = results.concat(priResults);
					cbPrivate = true;
					console.log("[DBPosts] FindTimeline->Private", "'" + (priResults[0] ? "Found Results" : "No Results"));
				}
			});
			collectionFriends.find({
				uid: req.body.uid
			}, function (friListErr, friListResults) {
				if (friListErr) {
					console.error("[DBPosts] FindTimeline->FriendsListSearch", "'" + friListErr.message + "'->'" + search + "'");

				} else {
					queryFriends.uid = {
						'$in': friListResults.friends
					};
					queryList.whitelist = {
						'$in': [req.body.uid]
					}
					collectionPosts.find(queryFriends).toArray(function (friErr, friResults) {
						if (friErr) {
							console.error("[DBPosts] FindTimeline->Friends", "'" + friErr.message + "'->'" + search + "'");

						} else {
							results = results.concat(friResults);
							cbFriends = true;
							console.log("[DBPosts] FindTimeline->Friends", "'" + (friResults[0] ? "Found Results" : "No Results"));
						}
					});
					collectionPosts.find(queryList).toArray(function (listErr, listResults) {
						if (listErr) {
							console.error("[DBPosts] FindTimeline->List", "'" + listErr.message + "'->'" + search + "'");
						} else {
							results = results.concat(listResults);
							cbList = true;
							console.log("[DBPosts] FindTimeline->List", "'" + (listResults[0] ? "Found Results" : "No Results"));
						}
					});
				}
			});
			//Start search loop after MAX_SEARCH_TIME seconds
			var count = 1;
			var resultsLoop = setInterval(function () {
				console.log("[DBPosts] FindTimeline", "Iteration " + count + " of " + MAX_TRIES);
				//If all searches are finish, then break loop, send back data
				if (cbPublic && cbPrivate && cbFriends && cbList) {
					console.log("[DBPosts] FindTimeline->Finished", "'Found'->'" + JSON.stringify(results) + "'");
					clearInterval(resultsLoop);
					results.sort(function (a, b) {
						a = new Date(a.history[a.history.length - 1].date);
						b = new Date(b.history[b.history.length - 1].date);
						return a > b ? -1 : a < b ? 1 : 0;
					});
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
						console.log("[DBPosts] FindTimeline->Finished", "'Attempts Exceeded'");
						console.log("[DBPosts] FindTimeline->Finished", "'Found'->'" + JSON.stringify(results) + "'");
						clearInterval(resultsLoop);
						callback({
							session: req.session,
							status: 'ok',
							data: results
						});
					}
				}
			}, MAX_TIME);
		} else {
			console.warn("[DBPosts] FindTimeline", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Update post visibility
	DBPosts.updateVisibility = function (req, res, callback) {
		var updates = {
			visibility: undefined
		};
		Object.keys(updates).forEach(k => {
			if (req.body[k] === undefined) {
				delete updates[k];
			} else {
				updates[k] = req.body[k];
			}
		});
		updates.whitelist = req.body.whitelist;
		console.log("[DBPosts] Update->Visibility", "'" + req.body.pid + "'->'" + JSON.stringify(updates) + "'");
		collectionPosts.update({
			_id: new ObjectID(req.body.pid)
		}, {
			$set: {
				visibility: updates.visibility
			},
			$addToSet: {
				whitelist: {
					$each: updates.whitelist
				}
			}
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.error("[DBPosts] Update", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok'
				});
			}
		});
	};

	//POST HISTORY
	//=====================================================================================================================================

	DBPosts.updateHistory = function (req, res, callback) {
		var updates = {
			image: undefined,
			text: undefined,
			location: undefined,
			poll: undefined
		};
		Object.keys(updates).forEach(k => {
			if (req.body[k] == undefined) {
				delete updates[k];
			} else {
				updates[k] = req.body[k];
			}
		});
		console.log("[DBPosts] UpdateHistory", "'" + req.body.pid + "'->'" + JSON.stringify(updates) + "'");
		updates.date = new Date();
		collectionPosts.update({
			_id: new ObjectID(req.body.pid)
		}, {
			$push: {
				history: updates
			}
		}, {
			upsert: true
		}, function (err, results) {
			if (err) {
				console.error("[DBPosts] UpdateHistory", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok'
				});
			}
		});
	};

	//COMMENTS
	//=====================================================================================================================================

	DBPosts.addComment = function (req, res, callback) {
		var date = new Date();
		var comment = {
			uid: undefined,
		};
		Object.keys(comment).forEach(k => {
			if (req.body[k] == undefined) {
				delete comment[k];
			} else {
				comment[k] = req.body[k];
			}
		});

		var commentData = {
			text: undefined,
			image: undefined,
		};

		Object.keys(commentData).forEach(k => {
			if (req.body.commentData[k] != undefined) {
				commentData[k] = req.body.commentData[k];
			}
		});
		console.log("[DBPosts] addComment", "'" + JSON.stringify(req.body) + "'");
		comment.history = [commentData];
		comment.history[0].date = date;
		comment._id = new ObjectID();
		collectionPosts.update({
			_id: new ObjectID(req.body.pid)
		}, {
			$push: {
				comments: comment
			}
		}, {
			upsert: true
		}, function (err, results) {
			if (err) {
				console.error("[DBPosts] AddComment", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok'
				});
			}
		});
	};

	DBPosts.removeComment = function (req, res, callback) {
		if (req.body.cid && req.body.pid) {
			collectionPosts.update({
				_id: new ObjectID(req.body.pid)
			}, {
				$pull: {
					comments: {
						_id: new ObjectID(req.body.cid)
					}
				}
			}, function (err, result) {
				if (err) {
					console.error("[DBPosts] RemoveComment", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					callback({
						session: req.session,
						status: 'ok'
					});
				}
			});
		} else {
			console.warn("[DBPosts] RemoveComment", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};
};