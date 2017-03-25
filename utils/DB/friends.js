var console = require("../consoleLogger");
module.exports = function (DBFriends, collectionFriends, collectionFriendRequests, collectionUsers) {
	//Adds the friendId to the userId's friend list
	DBFriends.add = function (userId, friendId, callback) {
		console.log("[DBFriends] Add", "'" + userId + "'->'" + friendId + "'");
		if (userId && friendId) {
			collectionFriends.update({
				_id: userId
			}, {
				$push: {
					friends: friendId
				}
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBFriends] Add", err.message);
					callback({
						status: 'fail'
					});
				} else {
					callback({
						status: 'ok'
					});
				}
			});
		} else {
			console.warn("[DBFriends] Add", "'Missing Fields'");
			callback({
				status: 'ok'
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
						status: 'ok'
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
			}, function (err, result) {
				if (err) {
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
					callback({
						session: req.session,
						status: 'ok',
						data: Object.keys(users)
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
				},
				function (err, result) {
					//TODO: Devin, Will changing this to err,result affect this?
					if (err) {
						console.error("[DBFriends] AddRequest", err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						if (result.length === 2) {
							collectionFriendRequests.insert({
								userid: userId,
								friendid: friendId
							}, function (err, result) {
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
										data: result
									});
								}
							});
						} else {
							console.warn("[DBFriends] AddRequest",
								"'" + result[result.findIndex((x) => {
									return x._id === userId;
								})]._id + "'->'" + result[result.findIndex((x) => {
									return x._id === friendId;
								})]._id + "'");
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
		console.log("[DBFriends] FindRequests", "'" + query.friendid ? query.friendid : "*" + "'->'" + query.userid ? query.userid : "*" + "'");
		if (Object.keys(query).length === 2) {
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
						status: 'ok'
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
		console.log("[DBFriends] RemoveRequest", "'" + query.friendid ? query.friendid : "*" + "'->'" + query.userid ? query.userid : "*" + "'");
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
};