var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBGroups, collectionGroups, collectionGroupMembers, collectionGroupAdmins, collectionGroupRequests) {
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
					var id = result.ops[0]._id;
					collectionGroupMembers.insert({
						_id: id,
						members: [row.creatorid]
					}, function (err, result) {
						if (err) {
							console.error("[DBGroups] AddMember", err.message);
							callback({
								session: req.session,
								status: 'fail'
							});
						} else {
							collectionGroupAdmins.insert({
								_id: id,
								admins: [row.creatorid]
							}, function (err, result) {
								if (err) {
									console.error("[DBGroups] AddAdmin", err.message);
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


	//Find a group by id
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
		collectionGroups.find(query).toArray(function (err, result) {
			if (err) {
				console.error("[DBGroups] Find", err.message);
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


	//Update group
	DBGroups.update = function (req, res, callback) {
		var updates = {
			name: req.body.name,
			creatorid: req.body.cid,
			ownerid: req.body.cid,
		};
		console.log("[DBGroups] Update", "'" + JSON.stringify(updates) + "'->'" + req.body._id + "'");
		Object.keys(updates).forEach(k => {
			if (req.body[k] === undefined) {
				delete updates[k];
			} else {
				updates[k] = req.body[k];
			}
		});
		if (req.body._id && updates) {
			collectionGroups.update({
				_id: new ObjectID(req.body._id)
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBGroups] Update", err.message);
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
			console.warn("[DBGroups] Update", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Remove a group
	DBGroups.remove = function (req, res, callback) {
		console.log("[DBGroups] Remove", "'" + req.params.gid + "'");
		if (req.params.gid) {
			collectionGroups.remove({
				_id: new ObjectID(req.params.gid)
			}, function (err, result) {
				if (err) {
					console.error("[DBGroups] Remove", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					collectionGroupMembers.remove({
						_id: new ObjectID(req.params.id)
					}, function (err, result) {
						if (err) {
							console.error("[DBGroups] RemoveMembers", err.message);
							callback({
								session: req.session,
								status: 'fail'
							});
						} else {
							collectionGroupAdmins.remove({
								_id: new ObjectID(req.params.id)
							}, function (err, result) {
								if (err) {
									console.error("[DBGroups] RemoveAdmins", err.message);
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
				}
			});
		} else {
			console.warn("[DBGroups] Remove", "'Missing Fields'");
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
		console.log("[DBGroups] AddRequest", "'" + userId + "'->'" + groupName + "'");
		if (userId && groupName) {
			//Check to see if group exists
			collectionGroups.find({
					name: groupName
				},
				function (err, result) {
					if (err) {
						console.error("[DBGroups] AddRequest", err.message);
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
									console.error("[DBGroups] AddRequest", err.message);
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
							console.warn("[DBGroups] AddRequest", "'NotFound'->'" + groupName + "'");
							callback({
								session: req.session,
								status: 'fail'
							});
						}
					}
				});
		} else {
			console.warn("[DBGroups] AddRequest", "'Missing Fields'");
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
		console.log("[DBGroups] FindRequests", "'" + query.groupName ? query.groupName : "*" + "'->'" + query.userid ? query.userid : "*" + "'");
		if (!Object.keys(query).length) {
			collectionGroupRequests.find(query).toArray(function (err, result) {
				if (err) {
					console.error("[DBGroups] FindRequests", err.message);
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
			console.warn("[DBGroups] FindRequests", "'Missing Fields'");
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
		console.log("[DBGroups] RemoveRequest", "'" + query.groupName ? query.groupName : "*" + "'->'" + query.userid ? query.userid : "*" + "'");
		if (Object.keys(query).length === 2) {
			collectionGroupRequests.remove(query, function (err, result) {
				if (err) {
					console.error("[DBGroups] RemoveRequest", err.message);
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
			console.warn("[DBGroups] RemoveRequest", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};