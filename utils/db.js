var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var path = require('path');
var EMS = require('./ems');
var utils = require('./utils');
var DBAuth = {};
var DBPosts = {};
var DBGroups = {};
var DBUsers = {};
var DBFriends = {};
var DBGroupMembers = {};
var DBComments = {};
var dbURL = 'mongodb://localhost:27017/db';

//Collections
var collectionUsers;
var collectionAuths;
var collectionFriends;
var collectionFriendRequests;
var collectionGroups;
var collectionGroupMembers;
var collectionGroupAdmins;
var collectionPosts;
var collectionComments;

//Connect to the database
var DB = mongoClient.connect(dbURL, function (err, DB) {
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
					$type: 'string'
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
					$type: /@mun\.ca$/
				}
			}, {
				auth: {
					$type: 'bool'
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
	DB.createCollection('auth', {
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
			}, {
				friends: {
					$type: 'array'
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
				created: {
					$type: 'date'
				}
			}, {
				modified: {
					$type: 'date'
				}
			}, {
				//What is this?
				dType: {
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

	//Variables set to mongo collections
	collectionAuths = DB.collection('auth');
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
DBUsers.add = function (user, callback) {
	if (!Object.keys(user).length) {
		console.log("[DB] Registration: no data");
	} else {
		//Create user
		try {
			var row = {
				fname: user.fname,
				lname: user.lname,
				pass: user.pass,
				dob: user.dob,
				address: user.address,
				gender: user.gender,
				email: user.email,
				auth: false,
				_id: utils.getIdFromEmail(user.email)
				//_id: req.body.uid
			};
			//Create auth key and store it in auths
			DBAuth.add(row, function (result) {
				callback("[DB] Registration: Added authkey with result\n" + result);
			});
			collectionUsers.insert(row, function (result) {
				callback(result);
			});
		} catch (err) {
			callback("[DB] Registration: Missing fields");
		}
	}
};

//Find a user by unique object id
DBUsers.findById = function (req, res, callback) {
	if (req.params.uid == undefined) {
		res.json({
			error: "undefined"
		});
	} else {
		collectionUsers.findOne({
			_id: req.params.uid
		}, function (err, result) {
			if (err) {
				console.warn(err);
			}
			//Returns null if error occured
			callback(result);
		});
	}
};

//Find users matching query
DBUsers.find = function (query, callback) {
	collectionUsers.find(query).toArray(function (err, results) {
		if (err) {
			console.warn(err);
		} else {
			callback(results);
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
		var updates = {};
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
	collectionAuths.insert(auth, function (result) {
		callback(result);
	});
	//Send auth email to the user with the auth link
	EMS.sendAuthEmail(row, auth, function (result) {
		callback(result);
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
		//DEVIN: Wheres the rest of this logic?
	}
};

//FRIEND REQUESTS
//======================================================================================================

//Add a friend request
DBFriends.addRequest = function (userId, friendId, callback) {
	collectionFriendRequests.insert({
		userid: userId,
		friendid: friendId
	}, function (err, result) {
		if (err) {
			console.warn(err);
		}
		callback(result);
	});
};

//Find all friend requests from a user
DBFriends.findRequests = function (req, res, callback) {
	var userId = req.params.uid;
	var friendId = req.params.fid;
	//Declare query variables
	var query;
	if (friendId) {
		query = {
			friendid: friendId
		};
	} else if (userId) {
		query = {
			userid: req.params.uid
		};
	} else {
		query = undefined;
	}
	if (query) {
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
			}
			callback(result);
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
DBPosts.add = function (post, callback) {
	var date = new Date();
	collectionPosts.insert({
		authorid: post.authorId,
		created: post.created,
		modified: post.modified,
		dType: post.dType,
		data: post.data
	}, function (err, result) {
		if (err) {
			console.warn(err);
		}
		callback(result);
	});
};

//Remove a post
DBPosts.remove = function (objectId, callback) {
	collectionPosts.remove({
		_id: objectId
	}, function (result) {
		callback(result);
	});
};

//Get posts per user
DBPosts.findByUserId = function (userId, callback) {
	collectionPosts.find({
		authorid: userId
	}).toArray(function (err, results) {
		if (err) {
			console.warn(err);
		}
		callback(results);
	});
};

//Update post
DBPosts.update = function (postId, updates, callback) {
	collectionPosts.update({
		_id: postId
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
DBComments.add = function (postId, authorId, data, callback) {
	var date = new Date();
	var comment = {
		commentid: authorId + date.getTime(),
		authorid: authorId,
		created: date,
		modified: date,
		history: [{
			data: data
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
DBComments.removeById = function (postId, commentId, callback) {
	collectionComments.remove({
		_id: postId,
		comments: {
			commentId: commentId
		}
	}, function (result) {
		callback(result);
	});
};

//Get comments per postId
DBComments.findByPostId = function (userId, callback) {
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
DBComments.update = function (postId, updates, callback) {
	collectionComments.update({
		_id: postId
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

module.exports = {
	Auth: DBAuth,
	Posts: DBPosts,
	Groups: DBGroups,
	Users: DBUsers,
	Friends: DBFriends,
	GroupMembers: DBGroupMembers,
	Comments: DBComments,
	DB_URL: dbURL
};