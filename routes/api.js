var express = require("express");
var router = express.Router();
var DB = require("../utils/db");
var EMS = require("../utils/ems");
var utils = require("../utils/utils");
//TODO: JOHN AND DEVIN WILL POPULATE THE TOP OF THIS FILE WITH ALL THE IMPLEMENTATION SEMANTICS
//==============================GET VERBS=============================

/**
 * findUserById
 *
 * URL:
 * 		- %server%/api/user/info/:uid
 * Descript:
 *      - Gets the user object from the database if they exist
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get
 * Returns:
 *      - JSON user object
 */
var findUserById = "/user/info/:uid";

/**
 * findFriendsById
 *
 * URL:
 * 		- %server%/api/user/friends/:uid
 * Descript:
 *      - Gets the friends for a given uid
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get
 * Returns:
 *      - JSON array containing user objects
 */
var findFriendsById = "/user/friends/:uid";

/**
 * findFriendSent
 *
 * URL:
 * 		- %server%/api/user/friends/sent/:uid
 * Descript:
 *      - Gets the friend requests sent from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests sent from
 * Returns:
 *      - JSON array containing friend request objects
 */
var findFriendSent = "/user/friends/sent/:uid";

/**
 * findFriendReceived
 *
 * URL:
 * 		- %server%/api/user/friends/received/:uid
 * Descript:
 *      - Gets the friend requests recieved from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests recieved from
 * Returns:
 *      - JSON array containing friend request objects
 */
var findFriendReceived = "/user/friends/received/:fid";
/**
 * findGroupsByID
 *
 * URL:
 * 		- %server%/api/user/groups/:uid
 * Descript:
 *      - Gets all groups that the user is in
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get groups from
 * Returns:
 *      - JSON array containing group objects
 */
var findGroupsByID = "/user/groups/:uid";

/**
 * findGroupsUsers
 *
 * URL:
 * 		- %server%/api/group/users/:gid
 * Descript:
 *      - Gets all users in a group
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id to get users from
 * Returns:
 *      - JSON array containing user objects
 */
var findGroupUsers = "/group/users/:gid";

/**
 * findGroupById
 *
 * URL:
 * 		- %server%/api/group/info/:gid
 * Descript:
 *      - Gets group from a group id
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id
 * Returns:
 *      - JSON group object
 */
var findGroupById = "/group/info/:gid";


//=============================POST VERBS=============================

/**
 * updateUser
 *
 * URL:
 * 		- %server%/api/user/update/:uid
 * Descript:
 *      - Updates an user's fields
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id
 * 		- email: The email address
 * 		- pass: The password
 * Returns:
 *      - JSON updated user object
 */
var updateUser = "/user/update/:uid";

/**
 * deleteUser
 *
 * URL:
 * 		- %server%/api/user/remove/:uid
 * Descript:
 *      - Deletes a user from the server
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id
 * Returns:
 *      - JSON user object before deletion
 */
var deleteUser = "/user/remove/:uid";

/**
 * registerUser
 *
 * URL:
 * 		- %server%/api/user/register
 * Descript:
 *      - Registers a user
 * Method:
 *      - POST
 * Params:
 * 		- fName: First name
 * 		- lName: Last name
 * 		- gender: gender
 * 		- dob: Birthdate
 * 		- email: Email address from @mun.ca
 * 		- pass: Password
 * 		- address: Address
 * Returns:
 *      - JSON user object after creation
 */
var registerUser = "/user/register";

/**
 * addFriendReq
 *
 * URL:
 * 		- %server%/api/user/add/request
 * Descript:
 *      - Send a friend request from one user to another
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to send the request from
 * 		- fid: The friend id to send the request to
 * Returns:
 *      - JSON friend request object
 */
var addFriendReq = "/user/add/request";

/**
 * delFriendReq
 *
 * URL:
 * 		- %server%/api/user/remove/request
 * Descript:
 *      - Delete a friend request from one user to another
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to delete the request from
 * 		- fid: The friend id to delete the request to
 * Returns:
 *      - JSON friend request object after deletion
 */
var delFriendReq = "/user/remove/request";

/**
 * delFriend
 *
 * URL:
 * 		- %server%/api/user/remove/friend
 * Descript:
 *      - Delete a friend
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to delete the friend from
 * 		- fid: The friend id to delete the friendship from
 * Returns:
 *      - devin?
 */
var delFriend = "/user/remove/friend";

/**
 * createGroup
 *
 * URL:
 * 		- %server%/api/group/create
 * Descript:
 *      - Create a group
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id that is creating the group
 * 		- name: The group name
 * Returns:
 *      - JSON group object after creation
 */
var createGroup = "/group/create";

/**
 * delGroup
 *
 * URL:
 * 		- %server%/api/group/remove/:gid
 * Descript:
 *      - Delete a group
 * Method:
 *      - POST
 * Params:
 *      - gid: The group id to be deleted
 * Returns:
 *      - JSON group object after deletion
 */
var delGroup = "/group/remove/:gid";

/**
 * updateGroup
 *
 * URL:
 * 		- %server%/api/group/update
 * Descript:
 *      - Update a group
 * Method:
 *      - POST
 * Params:
 *      - gid: The group id to be updated
 * 		- name: The group name
 * 		- descrip: The group description
 * Returns:
 *      - JSON group object after update
 */
var updateGroup = "/group/update";

/**
 * addGroupUser
 *
 * URL:
 * 		- %server%/api/group/add/user
 * Descript:
 *      - Add a user to a group
 * Method:
 *      - POST
 * Params:
 *      - gid: The group id
 * 		- uid: The user id to be added
 * Returns:
 *      - JSON group users object after creation
 */
var addGroupUser = "/group/add/user";

/**
 * delGroupUser
 *
 * URL:
 * 		- %server%/api/group/remove/user
 * Descript:
 *      - Delete a user from a group
 * Method:
 *      - POST
 * Params:
 *      - gid: The group id
 * 		- uid: The user id to be deleted
 * Returns:
 *      - JSON group users object after deletion
 */
var delGroupUser = "/group/remove/user";

/**
 * addPost
 *
 * URL:
 * 		- %server%/api/post/add/user
 * Descript:
 *      - Add a post
 * Method:
 *      - POST
 * Params:
 *      - authorid: The authors id
 * 		- origin: User or Group post
 * 		- dataType: Text, picture, etc
 * 		- data: Actual data
 * Returns:
 *      - JSON mongo result
 */
var addPost = "/post/add/user";
/**
 * findPostByPid
 *
 * URL:
 * 		- %server%/api/post/:pid
 * Descript:
 *      - Get a singular post by PostID
 * Method:
 *      - GET
 * Params:
 *      - pid: The post id
 * Returns:
 *      - JSON mongo result
 */
var findPostByPid = "/post/:pid";
/**
 * findPostByUid
 *
 * URL:
 * 		- %server%/api/post/user/:pid
 * Descript:
 *      - Get ALL posts by UserID
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * Returns:
 *      - JSON mongo result
 */
var findPostByUid = "/post/user/:uid";
//==========================================================================================

router.get(findUserById, function (req, res, next) {
	DB.Users.findById({
		req: req,
		res: res
	}, function (user) {
		res.json(user);
	});
});

/**
 * ??
 */
router.post(updateUser, function (req, res, next) {
	DB.Users.update(req, res, function (result) {
		console.log(result);
	});
});

//POST remove the user

router.post(deleteUser, function (req, res, next) {
	DB.Users.remove(req, res, function (result) {
		console.log(result);
	});
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
	DB.Friends.find(req, res, function (result) {
		//DEVIN: result[0]?
		res.json(result[0]);
	});

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
	DB.Friends.addRequest(req, res, function (requestResult) {
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
});

//GET get friend requests for a specified user
router.get(findFriendSent, function (req, res, next) {
	DB.Friends.findRequests(req, res, function (result) {
		res.json(result);
	});
});

//GET get recieved friend requests for a specified user
router.get(findFriendReceived, function (req, res, next) {
	DB.Friends.findRequests(req, res, function (result) {
		res.json(result);
	});
});

//Removes friend request
router.post(delFriendReq, function (req, res, next) {
	DB.Friends.removeRequest(req, res, function (result) {
		res.json(result);
	});
});

//POST remove friendId from userId
//Return json response
//Result: xy, where x is 0 for no error, 1 for error, y is 0 for successful deletion, 1 for unsuccessful deletion
router.post(delFriend, function (req, res, next) {
	DB.Friends.remove(req, res, function (result) {
		var dbResult = result.result;
		//Check for database error
		//DEVIN: This is totally broken now
		//TODO: Unbreak this (completely nuke it)
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
});

//Create a group
router.post(createGroup, function (req, res, next) {
	DB.Groups.add(req, res, function (result) {
		res.json(result);
	});
});

//Remove a group
router.post(delGroup, function (req, res, next) {
	DB.Groups.remove(req, res, function (result) {
		res.json(result);
	});
});

//find groups by userid
router.get(findGroupsByID, function (req, res, next) {
	DB.Groups.findByUserId(req, res, function (result) {
		res.json(result);
	});
});

//Update a group
router.post(updateGroup, function (req, res, next) {
	DB.Groups.update(req, res, function (result) {
		res.json(result);
	});
});

//Add member to group
router.post(addGroupUser, function (req, res, next) {
	DB.Groups.add(req, res, function (result) {
		res.json(result);
	});
});

//Remove member from group
router.post(delGroupUser, function (req, res, next) {
	DB.GroupMembers.remove(req, res, function (result) {
		res.json(result);
	});
});

//Find members for group
router.get(findGroupUsers, function (req, res, next) {
	DB.GroupMembers.find(req, res, function (result) {
		res.json(result);
	});
});

//Add post
router.post(addPost, function (req, res, next) {
	DB.Posts.add(req, res, function (result) {
		res.json(result);
	});
});

router.get(findPostByUid, function (req, res, next) {

});
router.get(findPostByPid, function (req, res, next) {

});

module.exports = router;