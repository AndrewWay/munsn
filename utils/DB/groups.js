var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBGroups, collectionGroups, collectionGroupMembers, collectionGroupAdmins, collectionGroupRequests, collectionUsers) {
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
						members: [{
							user: row.creatorid,
							admin: true
						}]
					}, function (err, result) {
						if (err) {
							console.error("[DBGroups] AddMember", err.message);
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

	DBGroups.findByUserID = function (req, res, callback) {
		var userId = req.UserID;
		console.log("[DBGroups] FindByUserID", "'" + userId + "'");
		if (userId) {
			collectionGroupMembers.find({
				"members.user": userId
			}, {
				fields: {
					_id: 1
				}
			}).toArray(function (err, results) {
				console.log(JSON.stringify(results));
				if (err) {
					console.error("[DBGroups] FindByUserID", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					callback({
						session: req.session,
						status: 'ok',
						data: results
					});
				}
			});
		} else {
			console.warn("[DBGroups] FindByUserID", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}

	};

	//Find group based on query
	DBGroups.find = function (req, res, callback) {
		var query = req.body;
		console.log("[DBGroups] Find", "'" + JSON.stringify(query) + "'");
		if (Object.keys(query).length) {
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
		} else {
			console.warn("[DBGroups] Find", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
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
						_id: new ObjectID(req.params.gid)
					}, function (err, result) {
						if (err) {
							console.error("[DBGroups] Remove->Members", err.message);
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
			console.warn("[DBGroups] Remove", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

    DBGroups.updateMember = function(req, res, callback) {
        collectionGroupMembers.update({_id: new ObjectID(req.body.gid), "members.user": req.body.uid}, {$set: {"members.$.admin": req.body.admin}}, function(err, results) {
            if (err) {
                console.error("[DBGroups] updateMember", err.message);
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
    };

    DBGroups.removeMember = function(req, res, callback) {
        collectionGroupMembers.findAndModify({_id: new ObjectID(req.body.gid)}, [['_id', 'ascending']], {$pull: {members: {user: req.body.uid}}}, {upsert: true, new: true}, function(err, results) {
            if (err) {
                console.error("[DBGroups] updateMember", err.message);
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
    };

    DBGroups.findMembers = function(req, res, callback) {
    collectionGroupMembers.find({_id: new ObjectID(req.params.gid)}).toArray(function(err, results) {
        if (err) {
            console.error("[DBGroups] updateMember", err.message);
            callback({
                session: req.session,
                status: 'fail'
            });
        }
        else {
            callback({
                session: req.session,
                status: 'ok',
                data: results
            });
        }
    });
};
    
	//GROUP REQUESTS
	//======================================================================================================

	//Send a group request
	DBGroups.sendRequest = function (req, res, callback) {
		//Declare body variables
		var userId = req.body.uid;
		var gid = req.body.gid;
		//Check if body variables are not null, or undefined
		console.log("[DBGroups] SendRequest", "'" + userId + "'->'" + gid + "'");
		if (userId && gid) {
			//Check to see if both users exist
			collectionUsers.find({
				_id: userId
			}).toArray(function (err, uResult) {
				if (err) {
					console.error("[DBGroups] SendRequest", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					collectionGroups.find({
						_id: new ObjectID(gid)
					}, function (err, gResult) {
						if (err) {
							console.error("[DBGroups] SendRequest", err.message);
							callback({
								session: req.session,
								status: 'fail'
							});
						} else {
							collectionGroupRequests.update({
								_id: new ObjectID(gid)
							}, {
								$addToSet: {
									requests: userId
								}
							}, {
								upsert: true
							}, function (err, results) {
								if (err) {
									console.error("[DBGroups] SendRequest", err.message);
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
			console.warn("[DBGroups] sendRequest", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find all group requests from a user
	DBGroups.findRequests = function (req, res, callback) {
		console.log("[DBGroups] FindRequests", "'" + req.params.gid);
		if (req.params.gid) {
			collectionGroupRequests.find({
				_id: new ObjectID(req.params.gid)
			}).toArray(function (err, results) {
				if (err) {
					console.error("[DBGroups] FindRequests", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					callback({
						session: req.session,
						status: 'ok',
						data: results
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

	//Remove group request
	DBGroups.removeRequest = function (req, res, callback) {
		console.log("[DBGroups] RemoveRequest", "'" + (req.body.uid ? req.body.uid : "*") + "'->'" + (req.body.gid ? req.body.gid : "*") + "'");
		if (req.body.uid && req.body.gid) {
			collectionGroupRequests.findAndModify({_id: new ObjectID(req.body.gid)}, [['_id', 'ascending']], {$pull: {requests: req.body.uid}}, {new: true, upsert: true}, function (err, result) {
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

	DBGroups.acceptRequest = function (req, res, callback) {
		console.log("[DBGroups] AcceptRequest", "'" + (req.body.uid ? req.body.uid : "*") + "'->'" + (req.body.gid ? req.body.gid : "*") + "'");
		if (req.body.uid && req.body.gid) {
			collectionGroupRequests.findAndModify({
				_id: req.body.gid
			}, [
				['_id', 'ascending']
			], {
				$pull: {
					requests: req.body.uid
				}
			}, {
				new: true,
				upsert: true
			}, function (findErr, findResults) {
				if (findErr) {
					console.error("[DBGroups] AcceptRequest", findErr.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					collectionGroupMembers.findAndModify({
						_id: new ObjectID(req.body.gid)
					}, [
						['_id', 'ascending']
					], {
						$addToSet: {
							members: {
								user: req.body.uid,
								admin: false
							}
						}
					}, {
						new: true,
						upsert: true
					}, function (err, results) {
						if (err) {
							console.error("[DBGroups] AcceptRequest", findErr.message);
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
			console.warn("[DBGroups] AcceptRequest", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	DBGroups.denyRequest = function (req, res, callback) {
		console.log("[DBGroups] DenyRequest", "'" + (req.body.uid ? req.body.uid : "*") + "'->'" + (req.body.gid ? req.body.gid : "*") + "'");
		if (req.body.uid && req.body.gid) {
			collectionGroupRequests.findAndModify({
				_id: new ObjectID(req.body.gid)
			}, [
				['_id', 'ascending']
			], {
				$pull: {
					requests: req.body.uid
				}
			}, {
				new: true,
				upsert: true
			}, function (findErr, findResults) {
				if (findErr) {
					console.error("[DBGroups] DenyRequest", findErr.message);
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
			console.warn("[DBGroups] DenyRequest", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};