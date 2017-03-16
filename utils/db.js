var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var path = require('path');
var EMS = require('./ems');
var utils = require('./utils');
var ObjectID = require('mongodb').ObjectID;
var DBAuth = {};
var DBPosts = {};
var DBGroups = {};
var DBUsers = {};
var DBFriends = {};
var DBGroupMembers = {};
var DBGroupAdmins = {};
var DBComments = {};
var dbURL = 'mongodb://localhost:27017/db';

//Collections
var collectionUsers; //Good
var collectionAuths; //Good
var collectionFriends; //Good
var collectionFriendRequests; //Good
var collectionGroups; //Good
var collectionGroupMembers; //Good
var collectionGroupAdmins; //JOHN: EVALUATE
var collectionPosts; //JOHN: EVALUATE
var collectionComments; //JOHN: EVALUATE

//DEVIN: TESTING
//Connect to the database
mongoClient.connect(dbURL, function (err, DB) {
	assert.equal(null, err);
	console.log('Connected to mongo server: ' + dbURL);
	//Restricts and denies user documents so they have a user, email from mun.ca, and pass
	DB.createCollection('users', {
		validator: {
			$and: [{
				fname: {
					$type: 'string'
				}
			}, {
				lname: {
					$type: 'string'
				}
			}, {
				pass: {
					$type: 'string'
				}
			}, {
				dob: {
					$type: 'date'
				}
			}, {
				address: {
					$type: 'string'
				}
			}, {
				gender: {
					$type: 'string'
				}
			}, {
				email: {
					$regex: /@mun\.ca$/
				}
			}, {
				auth: {
					$type: 'bool'
				}
			}, {
				/*
				private: Only the user can view the post
				public: Everyone can view the post
				friends: Only friends can view the post
				*/
				visibility: {
					$type: 'string'
				}
			}, {
				_id: {
					$type: 'string'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	//Restricts and denies regauth documents so that there is an authkey
	DB.createCollection('authkeys', {
		validator: {
			$and: [{
				key: {
					$type: 'string'
				}
			}, {
				userid: {
					$type: 'string'
				}
			}, {
				expiry: {
					$type: 'number'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	//Restricts and denies friend documents so that there is from/to, and accepted
	DB.createCollection('friends', {
		validator: {
			$and: [{
				_id: {
					$type: 'string'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	DB.createCollection('fRequests', {
		validator: {
			$and: [{
				userid: {
					$type: 'string'
				}
			}, {
				friendid: {
					$type: 'string'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	DB.createCollection('group', {
		validator: {
			$and: [{
				//GroupName
				name: {
					$type: 'string'
				}
			}, {
				//Foreign key for userid
				creatorid: {
					$type: 'string'
				}
			}, {
				//Foreign key for userid
				ownerid: {
					$type: 'string'
				}
			}, {
				courses: {
					$type: 'array'
				}
			}, {
				created: {
					$type: 'date'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});
	DB.createCollection('gMembers', {
		validator: {
			$and: [{
				//Group _id
				_id: {
					$type: 'string'
				}
			}, {
				//Array of userids
				members: {
					$type: 'array'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});
	DB.createCollection('gAdmins', {
		validator: {
			$and: [{
				//Group _id
				_id: {
					$type: 'string'
				}
			}, {
				//Array of userids
				admins: {
					$type: 'array'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});
	DB.createCollection('posts', {
		validator: {
			$and: [{
				//Foreign key for userid
				authorid: {
					$type: 'string'
				}
			}, {
				/*
				private: Only the user can view the post
				public: Everyone can view the post
				friends: Only friends can view the post
				list: Only a list of friends can view,

				For list, update to the array list(userId)
				*/
				visibility: {
					$type: 'string'
				}
			}, {
				//User or group
				origin: {
					$type: 'string'
				}
			}, {
				created: {
					$type: 'date'
				}
			}, {
				modified: {
					$type: 'date'
				}
			}, {
				dataType: {
					$type: 'string'
				}
			}, {
				data: {
					$type: 'string'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	/**
	 * The comments collection is a little special. It contains two fields:
	 *  - (objectId) _id: The same id as its matching post object (post._id = comment._id)
	 * 	- (Array[commentObject]) comments: The array containing the comment objects. Everytime a user comments on a post, we push to this array
	 * The commentObject contains:
	 *  - (string) cid: The comment id
	 *  - (string) author: The user id for the author
	 *  - (Array[dataObjects]) edits: The array containing the data objects. Every time a user edits their comment, we push to this array
	 * The dataObject contains:
	 *  - (string) data: The actual comment data
	 *  - (date) date: The date that the comment was edited
	 */
	DB.createCollection('comments', {
		validator: {
			$and: [{
				comments: {
					$type: 'array'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	//Variables set to mongo collections
	collectionAuths = DB.collection('authkeys');
	collectionUsers = DB.collection('users');
	collectionFriends = DB.collection('friends');
	collectionFriendRequests = DB.collection('fRequests');
	collectionGroups = DB.collection('groups');
	collectionGroupMembers = DB.collection('gMembers');
	collectionGroupAdmins = DB.collection('gAdmins');
	collectionPosts = DB.collection('posts');
	collectionComments = DB.collection('comments');
});

//USERS
//======================================================================================================

//Insert one user into the user collection
DBUsers.add = function (req, res, callback) {
	var result = {};
	if (!Object.keys(req.body).length) {
		console.log("[DB] Registration: Missing Data");
		callback({
			status: 'fail'
		});
	} else {
		//Create user
		try {
			var row = {
				fname: req.body.fname,
				lname: req.body.lname,
				pass: req.body.pass,
				dob: new Date(req.body.dob),
				address: req.body.address,
				gender: req.body.gender,
				email: req.body.email,
				auth: false,
				visibility: req.body.visibility ? req.body.visibility : "default",
				_id: utils.getIdFromEmail(req.body.email)
				//_id: req.body.uid
			};
			//Create auth key and store it in auths
			collectionUsers.insert(row, function (err, result) {
				if (err) {
					console.log("[DBUsers]: " + err.message);
					callback({
						status: 'fail'
					});
				} else {
					console.log("[DBUsers] Inserted: " + result.insertedIds[0]);
					collectionAuths.add(row, function (result) {
						callback(result);
					});
				}
			});
		} catch (err) {
			console.log("[DBUsers] Registration: Missing fields or other error");
			callback({
				status: 'fail'
			});
		}
	}
};

//Find a user by unique object id
DBUsers.findById = function (req, res, callback) {
	console.log("[DBUsers] FindById: " + req.params.uid);
	if (req.params.uid == undefined) {
		callback({
			status: 'fail'
		});
	} else {
		collectionUsers.findOne({
			_id: req.params.uid
		}, function (err, result) {
			if (err) {
				console.warn("[DBUsers]: " + err.message);
			}
			//Returns null if error occured
			callback({
				status: 'ok',
				data: result
			});
		});
	}
};

//Find users matching query
DBUsers.find = function (req, res, callback) {
	console.log("[DBUsers] Find: " + JSON.stringify(req.body));
	collectionUsers.find(req.body).toArray(function (err, result) {
		if (err) {
			console.warn("[DBUsers]: " + err.message);
		} else {
			callback({
				status: 'ok',
				data: result
			});
		}
	});
};

//Updates the user
DBUsers.update = function (req, res, callback) {
	if (req.params.uid == undefined) {
		res.json({
			error: "undefined"
		});
	} else {
		var updates = {
			pass: req.body.pass,
			email: req.body.email,
			visibility: req.body.visibility,
			address: req.body.address
		};
		collectionUsers.update({
			_id: req.params.uid
		}, {
			$set: updates
		}, {
			upsert: true
		}, function (err, obj) {
			if (err) {
				console.warn(err);
			} else {
				callback(obj.result);
			}
		});
	}
};

//Removes the user
DBUsers.remove = function (req, res, callback) {
	if (req.params.uid == undefined) {
		res.json({
			error: "undefined"
		});
	} else {
		collectionUsers.remove({
			_id: req.params.id
		}, {
			single: true
		}, function (err, obj) {
			if (err) {
				console.warn(err);
			} else {
				callback(obj.result);
			}
		});
	}
};

//AUTH
//======================================================================================================

//Add an authkey to regauths
DBAuth.add = function (row, callback) {
	var date = new Date();
	var authkey = row._id + date.getTime();
	var mins = 1;
	var expiry = utils.addMinsToDate(date, mins).getTime();
	//user, authkey, utils.addMinsToDate(date, mins).getTime()
	var auth = {
		userid: row._id,
		key: authkey,
		expiry: expiry
	};
	collectionAuths.insert(auth, function (err, result) {
		if (err) {
			console.log("[DBAuth]: " + err.message);
			callback({
				status: 'fail'
			});
		} else {
			var rz = result.ops[0];
			console.log("[DBAuth] Inserted: { Key: " + rz.key + ", userid: " + rz.userid + " }");
			//Send auth email to the user with the auth link
			EMS.sendAuthEmail(row, auth, function (err, message) {
				if (err) {
					console.log('[EMS]: ' + err);
					callback({
						status: 'fail'
					});
				} else {
					console.log('[EMS] Sent To: ' + message.header.to + '\n[EMS] Subject: ' + message.header.subject);
					callback({
						status: 'ok'
					});
				}
			});
		}
	});

};
DBAuth.update = function (user, authkey, expiry, callback) {
	var regAuth = {
		key: authkey,
		expiry: expiry
	};
	collectionAuths.update({
		userid: user._id
	}, {
		$set: regAuth
	}, {
		upsert: true
	}, function (err, obj) {
		if (err) {
			console.warn(err);
		} else {
			callback(obj.result);
		}
	});
	EMS.resendAuthEmail(user, authkey, function (result) {
		console.log(result);
	});
};
//Check for an existing authkey
DBAuth.find = function (authkey, callback) {
	collectionAuths.findOne({
		key: authkey
	}, function (err, result) {
		if (err) {
			console.warn(err);
		}
		callback(result);
	});
};

//Delete authkey
DBAuth.remove = function (authkey, callback) {
	collectionAuths.remove({
		key: authkey
	}, {
		single: true
	}, function (err, obj) {
		if (err) {
			console.warn(err);
		} else {
			callback(obj.result);
		}
	});
};

//FRIENDS
//======================================================================================================

//Adds the friendId to the userId's friend list
DBFriends.add = function (userId, friendId, callback) {
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
			console.warn(err);
		}
		callback(result);
	});
};

//Finds all friends of a userId and returns it as an array
DBFriends.find = function (req, res, callback) {
	if (req.params.uid) {
		collectionFriends.find({
			_id: req.params.uid
		}, {
			friends: true
		}).toArray(function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Removes the selected friendId from the specified userId
DBFriends.remove = function (req, res, callback) {
	//Declare body variables
	var userId = req.body.uid;
	var friendId = req.body.fid;
	//Check if body variables are not null, or undefined
	if (userId && friendId) {
		collectionFriends.update({
			_id: userId
		}, {
			$pull: {
				friends: friendId
			}
		}, function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	} else {
		res.json({status: 'fail'});
	}
};

//Suggest friends
DBFriends.suggest = function(req, res, callback) {
	var users = {};
	//Find friends of friends
	collectionFriends.aggregate([{$unwind: "$friends"}, {$lookup: {from: "friends", localField: "friends", foreignField: "_id", as: "fof"}}, {$match: {_id: req.params.uid}}], function(err, fof) {
		console.log(err);
		console.log(fof);
		console.log(JSON.stringify(fof[0].fof[0]));
		//Iterate through aggregation results
		for (i = 0; i < fof.length; i++) {
			//Iterate through the friends of friends
			for (j = 0; j < fof[i].fof[0].friends.length; j++) {
				//Skip if an index is the user itself, we don't want to add theirselves
				if (fof[i].fof[0].friends[j] == req.params.uid) continue;
				users[fof[i].fof[0].friends[j]] = true;
			}
		}
		callback(Object.keys(users));
	});

	//Find users in related groups
};

//FRIEND REQUESTS
//======================================================================================================

//Add a friend request
DBFriends.addRequest = function (req, res, callback) {
	//Declare body variables
	var userId = req.body.uid;
	var friendId = req.body.fid;
	//Check if body variables are not null, or undefined
	if (userId && friendId) {
		//Check to see if both users exist
		collectionUsers.find({
				_id: {
					$in: [userId, friendId]
				}
			},
			function (findResult) {
				if (findResult.length == 2) {
					collectionFriendRequests.insert({
						userid: userId,
						friendid: friendId
					}, function (err, result) {
						if (err) {
							console.warn(err);
						}
						callback(result);
					});
				}
			});
	} else {
		res.json({status: 'fail'});
	}
};

//Find all friend requests from a user
DBFriends.findRequests = function (req, res, callback) {
	var query = {
		friendid: req.params.fid,
		userid: req.params.uid
	};
	if (!Object.keys(query).length) {
		collectionFriendRequests.find(query).toArray(function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Remove friend request
DBFriends.removeRequest = function (req, res, callback) {
	//Declare body variables
	var userId = req.body.uid;
	var friendId = req.body.fid;
	if (userId && friendId) {
		collectionFriendRequests.remove({
			userid: userId,
			friendid: friendId
		}, function (result) {
			callback(result);
		});
	}
};

//GROUPS
//======================================================================================================

//Add a group
DBGroups.add = function (req, res, callback) {
	var creatorId = req.body.gid;
	var groupName = req.body.name;
	if (creatorId && groupName) {
		var date = new Date();
		collectionGroups.insert({
			name: groupName,
			creatorid: creatorId,
			ownerid: creatorId,
			courses: undefined,
			created: new Date()
		}, function (err, result) {
			if (err) {
				console.warn(err);
			} else {
				collectionGroupMembers.update({
					_id: result.ops[0]._id
				}, {
					$push: {
						members: creatorId
					}
				}, {
					upsert: true
				}, function (err, result) {
					if (err) {
						console.warn(err);
					}
					callback(result);
				});
			}
		});
	}
};


//Find a group by user
DBGroups.findByUserId = function (req, res, callback) {
	var userId = req.params.uid;
	if (userId) {
		collectionGroups.find({
			creatorid: userId
		}).toArray(function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Find group based on query
DBGroups.find = function (query, callback) {
	collectionGroups.find(query, function (err, result) {
		if (err) {
			console.warn(err);
		}
		callback(result);
	});
};


//Update group
DBGroups.update = function (req, res, callback) {
	var groupId = req.body.gid;
	var updates = req.body.updates;
	if (groupId && updates) {
		collectionGroups.update({
			_id: groupId
		}, {
			$set: updates
		}, {
			upsert: true
		}, function (err, obj) {
			if (err) {
				console.warn(err);
			} else {
				callback(obj.result);
			}
		});
	}

};

//Remove a group
DBGroups.remove = function (req, res, callback) {
	var groupid = req.params.gid;
	if (groupid) {
		collectionGroups.remove({
			_id: groupid
		}, function (result) {
			callback(result);
		});
	}
};

//GROUP ADMINS
//======================================================================================================

//Add admin to group
DBGroupAdmins.add = function (req, res, callback) {
	var groupId = req.body.gid;
	var adminId = req.body.uid;
	if (groupId && adminId) {
		collectionGroupAdmins.update({
			_id: groupId
		}, {
			$push: {
				admins: adminId
			}
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Finds all admins of a group and returns it as an array
DBGroupAdmins.find = function (req, res, callback) {
	var groupId = req.params.gid;
	if (groupId) {
		collectionGroupAdmins.find({
			_id: groupId
		}, {
			admins: true
		}).toArray(function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Removes admin from group
DBGroupAdmins.remove = function (req, res, callback) {
	var groupId = req.body.gid;
	var adminId = req.body.uid;
	if (groupId && adminId) {
		collectionGroupAdmins.update({
			_id: groupId
		}, {
			$pull: {
				admins: adminId
			}
		}, function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//GROUP MEMBERS
//======================================================================================================

//Add member to group
DBGroupMembers.add = function (req, res, callback) {
	var groupId = req.body.gid;
	var memberId = req.body.uid;
	if (groupId && memberId) {
		collectionGroupMembers.update({
			_id: groupId
		}, {
			$push: {
				members: memberId
			}
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Finds all members of a group and returns it as an array
DBGroupMembers.find = function (req, res, callback) {
	var groupId = req.params.gid;
	if (groupId) {
		collectionGroupMembers.find({
			_id: groupId
		}, {
			members: true
		}).toArray(function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//Removes member from group
DBGroupMembers.remove = function (req, res, callback) {
	var groupId = req.body.gid;
	var memberId = req.body.uid;
	if (groupId && memberId) {
		collectionGroupMembers.update({
			_id: groupId
		}, {
			$pull: {
				members: memberId
			}
		}, function (err, result) {
			if (err) {
				console.warn(err);
			}
			callback(result);
		});
	}
};

//POSTS
//======================================================================================================

//Add a post
DBPosts.add = function (req, res, callback) {
	var date = new Date();
	collectionPosts.insert({
		authorid: req.body.authorid,
		visibility: req.body.visibility,
		list: [],
		origin: req.body.origin,
		created: date,
		modified: date,
		dataType: req.body.dataType,
		data: req.body.data
	}, function (err, result) {
		if (err) {
			console.warn(err);
		}
		callback(result);
	});
};

//Remove a post by id
DBPosts.remove = function (req, res, callback) {
	collectionPosts.remove({
		_id: ObjectID(req.body.pid)
	}, function (result) {
		callback(result);
	});
};

//Get posts per user
DBPosts.findByUserId = function (req, res, callback) {
	collectionPosts.find({
		authorid: req.params.uid
	}).toArray(function (err, results) {
		if (err) {
			console.warn(err);
		}
		callback(results);
	});
};

//Get posts per post id
DBPosts.findByPostId = function (req, res, callback) {
	collectionPosts.find({
		_id: ObjectID(req.params.pid)
	}).toArray(function (err, results) {
		if (err) {
			console.warn(err);
		}
		callback(results);
	});
};

//Update post
DBPosts.update = function (req, res, callback) {
	var date = new Date();
	var updates = {};
	if (req.body.data) {
		updates.data = req.body.data;
		updates.modified = date;
	}
	if (req.body.visibility) updates.visibility = req.body.visibility;

	collectionPosts.update({
		_id: ObjectID(req.body.pid)
	}, {
		$set: updates
	}, {
		upsert: true
	}, function (err, obj) {
		if (err) {
			console.warn(err);
		} else {
			callback(obj.result);
		}
	});
};

//POST COMMENTS
//======================================================================================================

//Add a comment
DBComments.add = function (req, res, callback) {
	var date = new Date();
	var comment = {
		commentid: req.body.authorid + date.getTime(),
		authorid: req.body.authorid,
		data: [{
			data: req.body.data,
			date: req.body.date
		}]
	};
	collectionComments.update({
		_id: postId
	}, {
		$push: {
			comments: comment
		}
	}, {
		upsert: true
	}, function (err, result) {
		if (err) {
			console.warn(err);
		}
		callback(result);
	});
};

//Remove a comment using commentId
DBComments.removeById = function (req, res, callback) {
	collectionComments.remove({
		_id: postId,
		comments: {
			commentId: commentId
		}
	}, function (result) {
		callback(result);
	});
};

//Get comments per userid
DBComments.findByPostId = function (req, res, callback) {
	collectionComments.find({
		authorid: userId
	}).toArray(function (err, results) {
		if (err) {
			console.warn(err);
		}
		callback(results);
	});
};

//Update comment
DBComments.update = function (req, res, callback) {
	var updates = {};
	var date = new Date();
	if (req.params.data) {
		updates.data = req.params.data;
	}
	updates.date = date;
	collectionComments.update({
		_id: req.params.postId,
		"comments.cid": req.params.cid
	}, {
		$push: {
			edits: updates
		}
	}, {
		upsert: true
	}, function (err, obj) {
		if (err) {
			console.warn(err);
		} else {
			callback(obj.result);
		}
	});
};

module.exports = {
	Auth: DBAuth,
	Posts: DBPosts,
	Groups: DBGroups,
	Users: DBUsers,
	Friends: DBFriends,
	GroupMembers: DBGroupMembers,
	GroupAdmins: DBGroupAdmins,
	Comments: DBComments,
	DB_URL: dbURL
};