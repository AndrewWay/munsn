var express = require("express");
var router = express.Router();
var DB = require("../utils/db");
var EMS = require("../utils/ems");
var utils = require("../utils/utils");
//TODO: JOHN AND DEVIN WILL POPULATE THE TOP OF THIS FILE WITH ALL THE IMPLEMENTATION SEMANTICS
//==============================GET VERBS=============================
/**
 * URL: "%server%/api/user/info/:uid"
 */
var findUserById = "/user/info/:uid";
/**
 * URL: "%server%/api/user/friends/:uid"
 */
var findFriendsById = "/user/friends/:uid";
/**
 * URL: "%server%/api/user/friends/sent/:uid"
 */
var findFriendSent = "/user/friends/sent/:uid";
/**
 * URL: "%server%/api/user/friends/received/:uid"
 */
var findFriendReceived = "/user/friends/received/:uid";
/**
 * URL: "%server%/api/user/groups/:uid"
 */
var findGroupsByID = "/user/groups/:uid";
/**
 * URL: "%server%/api/group/users/:gid"
 */
var findGroupUsers = "/group/users/:gid";
/**
 * URL: "%server%/api/group/info/:gid"
 */
var findGroupById = "/group/info/:gid";
//=============================POST VERBS=============================
/**
 * URL: "%server%/api/user/update/:uid"
 */
var updateUser = "/user/update/:uid";
/**
 * URL: "%server%/api/user/remove/:uid"
 */
var deleteUser = "/user/remove/:uid";
/**
 * URL: "%server%/api/user/register"
 */
var registerUser = "/user/register";
/**
 * URL: "%server%/api/user/add/request"
 */
var addFriendReq = "/user/add/request";
/**
 * URL: "%server%/api/user/remove/request"
 */
var delFriendReq = "/user/remove/request";
/**
 * URL: "%server%/api/user/remove/friend"
 */
var delFriend = "/user/remove/friend";
/**
 * URL: "%server%/api/group/create"
 */
var createGroup = "/group/create";
/**
 * URL: "%server%/api/group/remove/:gid"
 */
var delGroup = "/group/remove/:gid";
/**
 * URL: "%server%/api/group/update"
 */
var updateGroup = "/group/update";
/**
 * URL: "%server%/api/group/add/user"
 */
var addGroupUser = "/group/add/user";
/**
 * URL: "%server%/api/group/remove/user"
 */
var delGroupUser = "/group/remove/user";
//==========================================================================================
/**
 * Returns the JSON object representing a user from the database
 */
router.get(findUserById, function (req, res, next) {
	if (req.params.uid == undefined) {
		res.json({
			error: "undefined"
		});
	} else {
		DB.Users.findById(req.params.uid, function (user) {
			res.json(user);
		});
	}
});

/**
 * ???
 */
router.post(updateUser, function (req, res, next) {
	if (req.params.uid == undefined) {
		res.json({
			error: "undefined"
		});
	} else {
		var pass = {
			pass: req.body.pass
		};
		DB.Users.update(req.params.uid, pass, function (result) {
			console.log(result);
		});
	}
});

//POST remove the user

router.post(deleteUser, function (req, res, next) {
	if (req.params.uid == undefined) {
		res.json({
			error: "undefined"
		});
	} else {
		DB.Users.remove(req.params.uid, function (result) {
			console.log(result);
		});
	}
});

//POST register the user
/**
 * Register the user by HTMLForm.
 */
router.post(registerUser, function (req, res, next) {
	//Insert user with false auth into colUsers
	DB.Users.add(req.body, function (result) {
		console.log(result);
	});
});

//GET list of friends from userId
router.get(findFriendsById, function (req, res, next) {
	if (req.params.uid) {
		DB.Friends.find(req.params.uid, function (result) {
			res.json(result[0]);
		});
	}
});

/*
//POST add friendId to userId
router.post('/post/addFriend', function(req, res, next) {
		if (req.body.userId && req.body.friendId) {
				DB.friends_addFriendToUser(req.body.userId, req.body.friendId, function(result) {
						console.log(result);
						res.json(JSON.stringify(result));
				});
		}
});
*/


router.post(addFriendReq, function (req, res, next) {
	//Declare body variables
	var userId = req.body.uid;
	var friendId = req.body.fid;
	//Check if body variables are not null, or undefined
	if (userId && friendId) {
		//Check to see if both users exist
		DB.Users.find({
				_id: {
					$in: [userId, friendId]
				}
			},
			function (findResult) {
				//If they both exist, add request
				if (findResult.length == 2) {
					DB.Friends.addRequest(userId, friendId, function (requestResult) {
						//Operation successfully completed
						if (requestResult != null) {
							res.json({
								result: "000",
								operation: "sendFriendRequest",
								text: "Sent friend request"
							});
						} else {
							//Error with collection friendRequest
							res.json({
								result: "001",
								operation: "sendFriendRequest",
								text: "Error with collection friendRequest"
							});
						}
					});
				} else {
					//Else return result json
					console.log("\x1b[32m%s\x1b[0m%s", "[API]", " /post/sendFriendRequest: userId: " + userId + ", friendId: " + friendId + ", dbResult: " + JSON.stringify(findResult));
					res.json({
						result: "010",
						operation: "sendFriendRequest",
						text: "One or more users could not be found"
					});
				}
			}
		);
	}
});

//GET get friend requests for a specified user
router.get(findFriendSent, function (req, res, next) {
	//Declare query variables
	var userId = req.params.uid;
	if (userId) {
		DB.Friends.findRequests({
				userId: userId
			},
			function (result) {
				res.json(result);
			}
		);
	}
});

//GET get recieved friend requests for a specified user
router.get(findFriendReceived, function (req, res, next) {
	//Declare query variables
	var userId = req.params.uid;
	if (userId) {
		DB.Friends.findRequests({
				friendId: userId
			},
			function (result) {
				res.json(result);
			}
		);
	}
});

//Removes friend request
router.post(delFriendReq, function (req, res, next) {
	//Declare body variables
	var userId = req.body.uid;
	var friendId = req.body.fid;
	if (userId && friendId) {
		DB.Friends.removeRequest(userId, friendId, function (result) {
			res.json(result);
		});
	}
});

//POST remove friendId from userId
//Return json response
//Result: xy, where x is 0 for no error, 1 for error, y is 0 for successful deletion, 1 for unsuccessful deletion
router.post(delFriend, function (req, res, next) {
	//Declare body variables
	var userId = req.body.uid;
	var friendId = req.body.fid;
	//Check if body variables are not null, or undefined
	if (userId && friendId) {
		DB.Friends.remove(userId, friendId, function (result) {
			var dbResult = result.result;
			//Check for database error
			if (dbResult == null) {
				console.log("\x1b[31m%s\x1b[0m%s", "[API]", " /post/removeFriend: userId: " + userId + ", friendId: " + friendId + ", dbResult: " + JSON.stringify(dbResult));
				res.json({
					result: "10",
					operation: "deleteFriend",
					text: "Database error"
				});
			} else {
				console.log("\x1b[32m%s\x1b[0m%s", "[API]", " /post/removeFriend: userId: " + userId + ", friendId: " + friendId + ", dbResult: " + JSON.stringify(dbResult));
				if (dbResult.ok == 1 && dbResult.nModified == 1) {
					res.json({
						result: "00",
						operation: "deleteFriend",
						text: "Removed friend from user"
					});
				} else if (dbResult.ok == 1 && dbResult.nModified == 0) {
					res.json({
						result: "01",
						operation: "deleteFriend",
						text: "Could not remove friend from user"
					});
				}
			}
		});
	}
});

//Create a group
router.post(createGroup, function (req, res, next) {
	var creatorId = req.body.gid;
	var groupName = req.body.name;
	if (creatorId && groupName) {
		DB.Groups.add(creatorId, groupName, function (result) {
			DB.Groups.add(result.ops[0]._id, creatorId, function (memberResult) {
				res.json(memberResult);
			});
		});
	}
});

//Remove a group
router.post(delGroup, function (req, res, next) {
	var groupId = req.params.gid;
	if (groupId) {
		DB.Groups.remove(groupId, function (result) {
			res.json(result);
		});
	}
});

//find groups by userid
router.get(getGroupsByUID, function (req, res, next) {
	var userId = req.params.uid;
	if (userId) {
		DB.Groups.findByUserId(userId, function (result) {
			res.json(result);
		});
	}
});

//Update a group
router.post(updateGroup, function (req, res, next) {
	var groupId = req.body.gid;
	var updates = req.body.updates;
	if (groupId && updates) {
		DB.Groups.update(groupId, updates, function (result) {
			res.json(result);
		});
	}
});

//Add member to group
router.post(addGroupUser, function (req, res, next) {
	var groupId = req.body.gid;
	var userId = req.body.uid;
	if (groupId && userId) {
		DB.Groups.add(groupId, userId, function (result) {
			res.json(result);
		});
	}
});

//Remove member from group
router.post(delGroupUser, function (req, res, next) {
	var groupId = req.body.gid;
	var userId = req.body.uid;
	if (groupId && userId) {
		DB.GroupMembers.remove(groupId, userId, function (result) {
			res.json(result);
		});
	}
});

//Find members for group
router.get(findGroupUsers, function (req, res, next) {
	var groupId = req.params.gid;
	if (groupId) {
		DB.GroupMembers.find(groupId, function (result) {
			res.json(result);
		});
	}
});

module.exports = router;