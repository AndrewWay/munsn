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
		var query = req.query;
		Object.assign(query, req.body);
		console.log("[DBPosts] FindTimeline", JSON.stringify(query.uid));
		if (query.uid) {
			var results = [];
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
				uid: query.uid
			};
			var queryFriends = {
				visibility: 'friends'
			};
			var queryList = {
				visibility: 'list'
			};
			//Modify queries if targetid is given
			if (query.targetid) {
				queryPrivate.targetid = query.targetid;
			}
			collectionPosts.find(queryPublic).toArray(function (publicError, publicResults) {
				if (publicError) {
					console.error("[DBPosts] FindTimeline->Public", "'" + publicError.message + "'");
				} else {
					results = publicResults.length ? results.concat(publicResults) : results;
					console.log("[DBPosts] FindTimeline->Public", "'Found'->'" + publicResults.length + "'");
				}
				cbPublic = true;
			});
			collectionPosts.find(queryPrivate).toArray(function (privateError, privateResults) {
				if (privateError) {
					console.error("[DBPosts] FindTimeline->Private", "'" + privateError.message + "'");

				} else {
					results = privateResults.length ? results.concat(privateResults) : results;
					console.log("[DBPosts] FindTimeline->Private", "'Found'->'" + privateResults.length + "'");
				}
				cbPrivate = true;
			});
			collectionFriends.findOne({
				_id: query.uid
			}, function (listErr, listResults) {
				if (listErr) {
					console.error("[DBPosts] FindTimeline->List", "'" + listErr.message + "'");

				} else if (listResults !== null) {
					//Add the current user to the list so they can see their own friends only posts
					listResults.friends.push(query.uid);
					queryFriends.uid = {
						'$in': listResults.friends
					};
					queryList.whitelist = {
						'$in': [query.uid]
					}
					collectionPosts.find(queryFriends).toArray(function (friendError, friendResults) {
						if (friendError) {
							console.error("[DBPosts] FindTimeline->Friends", "'" + friendError.message + "'");

						} else {
							results = friendResults.length ? results.concat(friendResults) : results;
							console.log("[DBPosts] FindTimeline->Friends", "'Found'->'" + friendResults.length + "'");
						}
						cbFriends = true;
					});
					collectionPosts.find(queryList).toArray(function (listError, listResults) {
						if (listError) {
							console.error("[DBPosts] FindTimeline->List", "'" + listError.message + "'");
						} else {
							results = listResults.length ? results.concat(listResults) : results;
							console.log("[DBPosts] FindTimeline->List", "'Found'->'" + listResults.length + "'");
						}
						cbList = true;
					});
				} else {
					cbList = true;
					cbFriends = true;
					console.log("[DBPosts] FindTimeline->Friends", "'Found'->'0'");
					console.log("[DBPosts] FindTimeline->List", "'Found'->'0'");
				}
			});
			//Start search loop after MAX_SEARCH_TIME seconds
			var count = 1;
			var resultsLoop = setInterval(function () {
				console.log("[DBPosts] FindTimeline", "'Searching...'");
				//If all searches are finish, then break loop, send back data
				if (cbPublic && cbPrivate && cbFriends && cbList) {
					console.log("[DBPosts] FindTimeline->Finished", "'Found[" + results.length + "]'->'" + JSON.stringify(results) + "'");
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
				}
				//NOTE: This code is garbage that is unncessary.
				/*else {
					//If not, then repeat MAX_SEARCH_TRIES amount
					if (count < MAX_TRIES) {
						//count++;
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
				}*/
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
			authorid: undefined
		};
		Object.keys(comment).forEach(k => {
			if (!req.body[k]) {
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
			if (!req.body.data[k]) {
				delete commentData[k];
			} else {
				commentData[k] = req.body.data[k];
			}
		});
		commentData.date = date;
		commentData.image = (commentData.image === "true" ? true : false);
		comment._id = new ObjectID();
		comment.history = [commentData];
		console.log("[DBPosts] addComment", "'" + JSON.stringify(comment) + "'");
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
					data: comment,
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