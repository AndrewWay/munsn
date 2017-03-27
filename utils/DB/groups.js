var console = require('../consoleLogger');
module.exports = function (DBGroups, collectionGroups, collectionGroupMembers, collectionGroupRequests) {
	//Add a group
	DBGroups.add = function (req, res, callback) {
		var row = {
			name: req.body.name,
			creatorid: req.body.uid,
			ownerid: req.body.uid,
			created: new Date()
		};
		console.log("[DBGroups] Add", "'" + row.creatorid + "'->'" + row.name + "'");
		if (row.name && row.ownerid) {
			collectionGroups.insert(row, function (err, result) {
				if (err) {
					console.error("[DBGroups] Add", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					collectionGroupMembers.insert({_id: result.ops[0]._id, members: [row.creatorid]}, function (err, result) {
						if (err) {
							console.error("[DBGroups] Add", err.message);
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
			console.warn("[DBGroups] Add Group", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};


	//Find a group by user
	DBGroups.findByUserId = function (req, res, callback) {
		var userId = req.UserID;
		console.log("[DBGroups] FindByUID", "'" + req.UserID + "'");
		if (userId) {
			collectionGroups.find({
				creatorid: userId
			}).toArray(function (err, result) {
				if (err) {
					console.error("[DBGroups] FindByUID", err.message);
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
			console.warn("[DBGroups] FindByUID", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find group based on query
	DBGroups.find = function (req, res, callback) {
		var query = req.body;
		console.log("[DBGroups] Find: '" + JSON.stringify(query) + "'");
		if (!Object.keys(query).length) {
			collectionGroups.find(query, function (err, result) {
				if (err) {
					console.error("[DBGroups] Find:" + err.message);
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
			console.warn("[DBGroups] Find: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};


	//Update group
	DBGroups.update = function (req, res, callback) {
		//TODO: HOW IS KYLE SUPPOSED TO GET GROUPIDS DEVIN!
		var groupId = req.body.gid;
		var updates = req.body.updates;
		console.log("[DBGroups] Update: '" + JSON.stringify(updates) + "'->'" + groupId + "'");
		if (groupId && updates) {
			collectionGroups.update({
				_id: groupId
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBGroups] Update: " + err.message);
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
			console.warn("[DBGroups] Update: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Remove a group
	DBGroups.remove = function (req, res, callback) {
		//TODO: DOES THIS MAKE SENSE DEVIN? PROBABLY NOT HOW IS KYLE SUPPOSED TO GET THIS GID SHIT
		var groupid = req.params.gid;
		console.log("[DBGroups] Remove: '" + groupid + "'");
		if (groupid) {
			collectionGroups.remove({
				_id: groupid
			}, function (err, result) {
				if (err) {
					console.error("[DBGroups] Remove: " + err.message);
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
			console.warn("[DBGroups] Remove: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//GROUP REQUESTS
	//======================================================================================================

	//Add a friend request
	DBGroups.addRequest = function (req, res, callback) {
		//Declare body variables
		var userId = req.body.uid;
		var groupName = req.body.gid;
		//Check if body variables are not null, or undefined
		console.log("[DBGroups] AddRequest: '" + userId + "'->'" + groupName + "'");
		if (userId && groupName) {
			//Check to see if group exists
			collectionGroups.find({
					name: groupName
				},
				function (err, result) {
					if (err) {
						console.error("[DBGroups] AddRequest: " + err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						if (result) {
							collectionGroupRequests.insert({
								userid: userId,
								groupName: groupName
							}, function (err, result) {
								if (err) {
									console.error("[DBGroups] AddRequest: " + err.message);
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
							console.warn("[DBGroups] AddRequest: Group(s) not found");
							callback({
								session: req.session,
								status: 'fail'
							});
						}
					}
				});
		} else {
			console.warn("[DBGroups] AddRequest:  Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find all group requests from a user
	DBGroups.findRequests = function (req, res, callback) {
		var query = {
			groupName: req.params.gid,
			userid: req.UserID
		};
		console.log("[DBGroups] FindRequests: '" + query.groupName ? query.groupName : "*" + "'->'" + query.userid ? query.userid : "*" + "'");
		if (!Object.keys(query).length) {
			collectionGroupRequests.find(query).toArray(function (err, result) {
				if (err) {
					console.error("[DBGroups] FindRequests: " + err.message);
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
			console.warn("[DBGroups] FindRequests: 'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Remove friend request
	DBGroups.removeRequest = function (req, res, callback) {
		//Declare body variables
		var query = {
			userid: req.body.uid,
			groupName: req.body.gid
		};
		console.log("[DBGroups] RemoveRequest: '" + query.groupName ? query.groupName : "*" + "'->'" + query.userid ? query.userid : "*" + "'");
		if (Object.keys(query).length === 2) {
			collectionGroupRequests.remove(query, function (err, result) {
				if (err) {
					console.error("[DBGroups] RemoveRequest: " + err.message);
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
			console.warn("[DBGroups] RemoveRequest: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};