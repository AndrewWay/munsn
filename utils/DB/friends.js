var console = require("../consoleLogger");
module.exports = function (DBFriends, collectionFriends, collectionFriendRequests, collectionUsers) {
	//Adds the friendId to the userId's friend list
	DBFriends.add = function (req, res, callback) {
		//Declare body variables
		var userId = req.body.uid;
		var friendId = req.body.fid;
		console.log("[DBFriends] Add", "'" + userId + "'->'" + friendId + "'");
		if (userId && friendId) {
			collectionUsers.find({
				_id: {
					$in: [userId, friendId]
				}
			}).toArray(function (findErr, findResult) {
				console.log("[DBFriends] Add", "'" + JSON.stringify(findResult) + "'");
				if (findResult.length === 2) {
					collectionFriends.update({
						_id: userId
					}, {
						$addToSet: {
							friends: friendId
						}
					}, {
						upsert: true
					}, function (uidErr, uidResult) {
						if (uidErr) {
							console.error("[DBFriends] Add", uidErr.message);
							callback({
								status: 'fail'
							});
						} else {
							collectionFriends.update({
								_id: friendId
							}, {
								$addToSet: {
									friends: userId
								}
							}, {
								upsert: true
							}, function (fidErr, fidResult) {
								if (fidErr) {
									console.error("[DBFriends] Add", fidErr.message);
									callback({
										status: 'fail'
									});
								} else {
									callback({
										status: 'ok'
									});
								}
							});
						}
					});
				} else {
					console.warn("[DBFriends] Add", "'Cannot Find User(s)'");
					callback({
						status: 'fail'
					});
				}
			});
		} else {
			console.warn("[DBFriends] Add", "'Missing Fields'");
			callback({
				status: 'fail'
			});
		}
	};

	//Finds all friends of a userId and returns it as an array
	DBFriends.find = function (req, res, callback) {
		console.log("[DBFriends] Find", "'" + req.UserID + "'");
		if (req.UserID) {
			collectionFriends.find({
				_id: req.UserID
			}, {
				friends: true
			}).toArray(function (err, result) {
				if (err) {
					console.error("[DBFriends] Find", err.message);
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
		} else {
			console.warn("[DBFriends] Find", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Removes the selected friendId from the specified userId
	DBFriends.remove = function (req, res, callback) {
		//Declare body variables
		var userId = req.body.uid;
		var friendId = req.body.fid;
		//Check if body variables are not null, or undefined
		console.log("[DBFriends] Remove", "'" + userId + "'<->'" + friendId + "'");
		if (userId && friendId) {
			collectionFriends.update({
				_id: userId
			}, {
				$pull: {
					friends: friendId
				}
			}, function (uidErr, uidResult) {
				if (uidErr) {
					console.warn("[DBFriends] Remove", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					collectionFriends.update({
						_id: friendId
					}, {
						$pull: {
							friends: userId
						}
					}, function (fidErr, fidResult) {
						if (fidErr) {
							console.warn("[DBFriends] Remove", err.message);
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
				}
			});
		} else {
			console.warn("[DBFriends] Remove", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Suggest friends
	DBFriends.suggest = function (req, res, callback) {
		console.log("[DBFriends] Suggest", "'" + req.UserID + "'");
		var users = {};
		//Find friends of friends
		collectionFriends.aggregate([{
			$unwind: "$friends"
		}, {
			$lookup: {
				from: "friends",
				localField: "friends",
				foreignField: "_id",
				as: "fof"
			}
		}, {
			$match: {
				_id: req.UserID
			}
		}], function (err, fof) {
			if (err) {
				console.error("[DBFriends] Suggest", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				if (fof && fof.length > 0) {
					//Iterate through aggregation results
					for (var i = 0; i < fof.length; i++) {
						//Iterate through the friends of friends
						for (var j = 0; j < fof[i].fof[0].friends.length; j++) {
							//Skip if an index is the user itself, we don't want to add theirselves
							if (fof[i].fof[0].friends[j] === req.UserID) {
								continue;
							}
							users[fof[i].fof[0].friends[j]] = true;
						}
					}
                    //TODO: remove this collection call if things break
                    //Trim users that are already friends with the specific user
                    var usersArr = Object.keys(users);
                    collectionFriends.findOne({_id: req.UserID}, function(err, results) {
                        if (results) {
                            for (var i = 0; i < usersArr.length; i++) {
                                for (var j = 0; j < results.friends.length; j++) {
                                    if (usersArr[i] == results.friends[j]) {
                                        usersArr.splice(i, 1);
                                        i = i-1;
                                        continue;
                                    }
                                }
                            }
                            callback({
                                session: req.session,
                                status: 'ok',
                                data: usersArr
                            });
                        }
                        else {
                            console.warn("[DBFriends] Suggest", "Error for " + req.userId);
                            callback({
                                session: req.session,
                                status: 'fail'
                            });
                        }
                    });
				} else {
					console.warn("[DBFriends] Suggest", "'None'->'" + req.UserID + "'");
					callback({
						session: req.session,
						status: 'fail'
					});
				}
			}
		});
	};

	//FRIEND REQUESTS
	//======================================================================================================

	//Add a friend request
	DBFriends.addRequest = function (req, res, callback) {
		//Declare body variables
		var userId = req.body.uid;
		var friendId = req.body.fid;
		//Check if body variables are not null, or undefined
		console.log("[DBFriends] AddRequest", "'" + userId + "'->'" + friendId + "'");
		if (userId && friendId) {
			//Check to see if both users exist
			collectionUsers.find({
				_id: {
					$in: [userId, friendId]
				}
			}).toArray(
				function (err, fResult) {
					if (err) {
						console.error("[DBFriends] AddRequest", err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						if (fResult.length === 2) {
							collectionFriendRequests.insert({
								userid: userId,
								friendid: friendId
							}, function (err, iResult) {
								if (err) {
									console.error("[DBFriends] AddRequest", err.message);
									callback({
										session: req.session,
										status: 'fail'
									});
								} else {
									callback({
										session: req.session,
										status: 'ok',
										data: iResult
									});
								}
							});
						} else {
							var uid = fResult[fResult.findIndex((x) => {
								return x._id === userId;
							})] || {
								_id: 'NotFound'
							};
							var fid = fResult[fResult.findIndex((x) => {
								return x._id === friendId;
							})] || {
								_id: 'NotFound'
							};
							console.warn("[DBFriends] AddRequest",
								"'" + uid._id + "'->'" + fid._id + "'");
							callback({
								session: req.session,
								status: 'fail'
							});
						}
					}
				});
		} else {
			console.warn("[DBFriends] AddRequest", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find all friend requests from a user
	DBFriends.findRequests = function (req, res, callback) {
		var query = {
			friendid: req.params.fid,
			userid: req.UserID
		};
		Object.keys(query).forEach(k => {
			if (!query[k]) {
				delete query[k];
			}
		});
		console.log("[DBFriends] FindRequests", "'" + (query.userid ? query.userid : "*") + "'->'" + (query.friendid ? query.friendid : "*") + "'");
		if (Object.keys(query).length > 0) {
			collectionFriendRequests.find(query).toArray(function (err, result) {
				if (err) {
					console.error("[DBFriends] FindRequests", err.message);
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
		} else {
			console.warn("[DBFriends] FindRequests", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Remove friend request
	DBFriends.removeRequest = function (req, res, callback) {
		//Declare body variables
		var query = {
			userid: req.body.uid,
			friendid: req.body.fid
		};
		console.log("[DBFriends] RemoveRequest", "'" + (query.userid ? query.userid : "*") + "'->'" + (query.friendid ? query.friendid : "*") + "'");
		if (Object.keys(query).length === 2) {
			collectionFriendRequests.remove(query, function (err, result) {
				if (err) {
					console.error("[DBFriends] RemoveRequest", err.message);
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
			console.warn("[DBFriends] RemoveRequest", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	DBFriends.acceptFriendReq = function (req, res, callback) {
		console.log("[DBFriends] AcceptFriendReq", "'" + (req.body.uid ? req.body.uid : "*") + "'->'" + (req.body.fid ? req.body.fid : "*") + "'");
		if (req.body.uid && req.body.fid) {
			collectionFriendRequests.findAndRemove({userid: req.body.uid, friendid: req.body.fid}, function(findErr, findResults) {
				if (findErr) {
					console.error("[DBFriends] AcceptFriendReq", findErr.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				}
				else {
					DBFriends.add(req, res, function(result) {
						if (result.status === 'fail') {
							console.error("[DBFriends] AcceptFriendReq", result.status);
							callback({
								session: req.session,
								status: 'fail'
							});						
						}
						else {
							callback({
								session: req.session,
								status: 'ok'
							});			
						}
					});
				}
			});
		} else {
			console.warn("[DBFriends] AcceptFriendReq", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	DBFriends.denyFriendReq = function (req, res, callback) {
		console.log("[DBFriends] DenyFriendReq", "'" + (req.body.uid ? req.body.uid : "*") + "'->'" + (req.body.fid ? req.body.fid : "*") + "'");
		if (req.body.uid && req.body.fid) {
			collectionFriendRequests.findAndRemove({userid: req.body.uid, friendid: req.body.fid}, function(findErr, findResults) {
				if (findErr) {
					console.error("[DBFriends] DenyFriendReq", findErr.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				}
				else {
					callback({
						session: req.session,
						status: 'ok'
					});		
				}
			});
		} else {
			console.warn("[DBFriends] DenyFriendReq", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};