var express = require("express");
var router = express.Router();
var DB = require("../utils/db");
var EMS = require("../utils/ems");
var utils = require("../utils/utils");
var UserID = require("../middleware/functions").UserID;
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
 * findUser
 *
 * URL:
 * 		- %server%/api/user/info/
 * Descript:
 *      - Gets the user object with a query
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get
 * Returns:
 *      - JSON user object
 */
var findUser = "/users";

/**
 * findFriendsById
 *
 * URL:
 * 		- %server%/api/friends/:uid
 * Descript:
 *      - Gets the friends for a given uid
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get
 * Returns:
 *      - JSON array containing user objects
 */
var findFriendsById = "/friends/:uid";

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
var findFriendSent = "/friends/sent/:uid";

/**
 * findFriendReceived
 *
 * URL:
 * 		- %server%/api/user/friends/received/:fid
 * Descript:
 *      - Gets the friend requests recieved from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests recieved from
 * Returns:
 *      - JSON array containing friend request objects
 */
var findFriendReceived = "/friends/received/:fid";
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
 * 		- %server%/api/post/user/:uid
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

/**
 * suggestFriends
 *
 * URL:
 * 		- %server%/api/friends/suggest/:uid
 * Descript:
 *      - Get a list of suggested friends
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * 		- limit: The amount of suggested friends to return
 * Returns:
 *      - JSON user object array
 */
var suggestFriends = "/friends/suggest/:uid";

/**
 * findCourseById
 *
 * URL:
 * 		- %server%/api/course/find/:id
 * Descript:
 *      - Get a course by id
 * Method:
 *      - GET
 * Params:
 *      - uid: The course id
 * Returns:
 *      - JSON course object
 */
var findCourseById = "/course/find/:id";

/**
 * findCourse
 *
 * URL:
 * 		- %server%/api/course/find
 * Descript:
 *      - Get a course based on query
 * Method:
 *      - GET
 * Params:
 *		_id: The course unique object id
 *		label: Shorthand name, ex. "COMP 4770"
 *		name: Full name, ex. "Team Project"
 *		description: Description
 *		semester: Semester, ex. "winter"
 *		department: Department that the course belongs to, ex. "cs"
 *		location: Room number, ex. "EN 1051"
 *		year: Current year the course is offered
 *		cid: Creator id
 *		days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]
 *		timeStart: (date)The course start date, ex. "Jan. 1"
 *		timeEnd: (date) The course end date, ex. "Apr. 12"
 * Returns:
 *      - JSON course object array
 */
var findCourse = "/course/find";

/**
 * findLostById
 *
 * URL:
 * 		- %server%/api/lost/find/:uid
 * Descript:
 *      - Get a course by id
 * Method:
 *      - GET
 * Params:
 *      - uid: The lost id
 * Returns:
 *      - JSON lost object
 */
var findLostById = "/lost/find/:uid";

/**
 * findLost
 *
 * URL:
 * 		- %server%/api/lost/find
 * Descript:
 *      - Get a lost based on query
 * Method:
 *      - GET
 * Params:
 *		_id: The lost unique object id
 *		imagePath: The path to an image if supplied
 *		description: Description
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON lost object array
 */
var findLost = "/lost/find";

/**
 * findGroupsAdmins
 *
 * URL:
 * 		- %server%/api/group/admins/:gid
 * Descript:
 *      - Gets all admins in a group
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id to get admins from
 * Returns:
 *      - JSON array containing user objects
 */
var findGroupAdmins = "/group/admins/:gid";

/**
 * findGroupSent
 *
 * URL:
 * 		- %server%/api/user/group/sent/:uid
 * Descript:
 *      - Gets the group requests sent from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests sent from
 * Returns:
 *      - JSON array containing group request objects
 */
var findGroupSent = "/user/group/sent/:uid";

/**
 * findGroupReceived
 *
 * URL:
 * 		- %server%/api/user/group/received/:gid
 * Descript:
 *      - Gets the group requests recieved for a group
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id to get requests recieved from
 * Returns:
 *      - JSON array containing group request objects
 */
var findGroupReceived = "/group/received/:gid";

/**
 * findCommentById
 *
 * URL:
 * 		- %server%/api/comment/find/:uid
 * Descript:
 *      - Get comments by user id
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * Returns:
 *      - JSON array containing comment objects
 */
var findCommentById = "/comment/find/:uid";

/**
 * loadMessages
 *
 * URL:
 * 		- %server%/api/messages/load/
 * Descript:
 *      - Get messages from a conversation
 * Method:
 *      - GET
 * Params:
 *      - uid1: The first user id
 * 		- uid2: The second user id
 * Returns:
 *      - JSON array containing messages
 */
var loadMessages = "/messages/load";

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
 * loginUser
 *
 * URL:
 * 		- %server%/api/user/login
 * Descript:
 *      - Logs user into the site
 * Method:
 *      - POST
 * Params:
 *      - uid: User's id
 *      - pass: User's password
 * Returns:
 *      - JSON user
 */
var loginUser = "/user/login";
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
var addFriendReq = "/friends/add/request";

/**
 * acceptFriendReq
 *
 * URL:
 * 		- %server%/api/friends/accept/request
 * Descript:
 *      - Accept a friend request
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to accept the request from (reciever)
 * 		- fid: The friend id to accept the request to (sender)
 * Returns:
 *      - JSON friend request object after deletion
 */
var acceptFriendReq = "/friends/accept/request";

/**
 * delFriendReq
 *
 * URL:
 * 		- %server%/api/friends/deny/request
 * Descript:
 *      - Delete a friend request from one user to another
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to delete the request from (reciever)
 * 		- fid: The friend id to delete the request to (sender)
 * Returns:
 *      - JSON friend request object after deletion
 */
var denyFriendReq = "/friends/deny/request";

/**
 * addFriend
 *
 * URL:
 * 		- %server%/api/friends/add/friend
 * Descript:
 *      - Add a friend
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to delete the friend from
 * 		- fid: The friend id to delete the friendship from
 * Returns:
 *      - Mongo result
 */
var addFriend = "/friends/add";

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
 *      - Mongo result
 */

var delFriend = "/friends/remove";

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
 * addTimelinePost
 *
 * URL:
 * 		- %server%/api/post/add/timeline
 * Descript:
 *      - Add a user timeline post
 * Method:
 *      - POST
 * Params:
 *      - authorid: The authors id
 * 		- origin: The userid of the timeline
 * 		- dataType: Text, picture, etc
 * 		- data: Actual data
 * Returns:
 *      - JSON mongo result
 */
var addTimelinePost = "/post/add/timeline";
/**
 * addGroupPost
 *
 * URL:
 * 		- %server%/api/post/add/group
 * Descript:
 *      - Add a group post
 * Method:
 *      - POST
 * Params:
 *      - authorid: The authors id
 * 		- origin: The groupid
 * 		- dataType: Text, picture, etc
 * 		- data: Actual data
 */
var addGroupPost = "/post/add/group";

/**
 * delPost
 *
 * URL:
 * 		- %server%/api/post/remove/
 * Descript:
 *      - Delete a post
 * Method:
 *      - POST
 * Params:
 *      - pid: The post id
 * Returns:
 *      - JSON mongo result
 */
var delPost = "/post/remove";

/**
 * updatePost
 *
 * URL:
 * 		- %server%/api/post/update
 * Descript:
 *      - Update a post
 * Method:
 *      - POST
 * Params:
 * 		- data: Actual data
 * Returns:
 *      - JSON mongo result
 */
var updatePost = "/post/update";

/**
 * createCourse
 *
 * URL:
 * 		- %server%/api/course/create
 * Descript:
 *      - Create a course
 * Method:
 *      - POST
 * Params:
 *		label: Shorthand name, ex. "COMP 4770"
 *		name: Full name, ex. "Team Project"
 *		description: Description
 *		semester: Semester, ex. "winter"
 *		department: Department that the course belongs to, ex. "cs"
 *		location: Room number, ex. "EN 1051"
 *		year: Current year the course is offered
 *		cid: Creator id
 *		days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]
 *		timeStart: (date)The course start date, ex. "Jan. 1"
 *		timeEnd: (date) The course end date, ex. "Apr. 12"
 * Returns:
 *      - JSON mongo result
 */
var createCourse = "/course/create";

/**
 * updateCourse
 *
 * URL:
 * 		- %server%/api/course/update
 * Descript:
 *      - Update a course
 * Method:
 *      - POST
 * Params:
 *		_id: The course unique object id
 *		label: Shorthand name, ex. "COMP 4770"
 *		name: Full name, ex. "Team Project"
 *		description: Description
 *		semester: Semester, ex. "winter"
 *		department: Department that the course belongs to, ex. "cs"
 *		location: Room number, ex. "EN 1051"
 *		year: Current year the course is offered
 *		cid: Creator id
 *		days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]
 *		timeStart: (date)The course start date, ex. "Jan. 1"
 *		timeEnd: (date) The course end date, ex. "Apr. 12"
 * Returns:
 *      - JSON mongo result
 */
var updateCourse = "/course/update";

/**
 * removeCourse
 *
 * URL:
 * 		- %server%/api/course/delete
 * Descript:
 *      - Remove a course
 * Method:
 *      - POST
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var deleteCourse = "/course/delete";

/**
 * addCourseToUser
 *
 * URL:
 * 		- %server%/api/course/user/add
 * Descript:
 *      - Add a course to a user
 * Method:
 *      - POST
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var addCourseToUser = "/course/user/add";

/**
 * delCourseFromUser
 *
 * URL:
 * 		- %server%/api/course/user/del
 * Descript:
 *      - Delete a course from a user
 * Method:
 *      - POST
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var delCourseFromUser = "/course/user/del";

/**
 * addLost
 *
 * URL:
 * 		- %server%/api/lost/add
 * Descript:
 *      - Add a Lost
 * Method:
 *      - POST
 * Params:
 *		imagePath: The path to an image if supplied
 *		description: Description
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON mongo result
 */
var addLost = "/lost/add";

/**
 * updateLost
 *
 * URL:
 * 		- %server%/api/lost/update
 * Descript:
 *      - Update a Lost
 * Method:
 *      - POST
 * Params:
 *		_id: The lost unique object id
 *		imagePath: The path to an image if supplied
 *		description: Description
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON mongo result
 */
var updateLost = "/lost/update";

/**
 * removeLost
 *
 * URL:
 * 		- %server%/api/lost/remove
 * Descript:
 *      - Remove a Lost
 * Method:
 *      - POST
 * Params:
 *		_id: The Lost unique object id
 * Returns:
 *      - JSON mongo result
 */
var removeLost = "/lost/remove";

/**
 * addGroupAdmin
 *
 * URL:
 * 		- %server%/api/group/add/admin
 * Descript:
 *      - Add an admin
 * Method:
 *      - POST
 * Params:
 *		imagePath: The path to an image if supplied
 *		description: Description
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON mongo result
 */
var addGroupAdmin = "/group/add/admin";

/**
 * removeGroupAdmin
 *
 * URL:
 * 		- %server%/api/group/remove/admin
 * Descript:
 *      - Remove an admin
 * Method:
 *      - POST
 * Params:
 *		_id: The admin unique object id
 * Returns:
 *      - JSON mongo result
 */
var removeGroupAdmin = "/group/remove/admin";

/**
 * addComment
 *
 * URL:
 * 		- %server%/api/comment/add
 * Descript:
 *      - Add a comment
 * Method:
 *      - POST
 * Params:
 *      pid: The post id to which the comment belongs to
 *      authorid: The author's id
 *      data: The comment data
 * Returns:
 *      - JSON mongo result
 */
var addComment = "/comment/add";

/**
 * updateComment
 *
 * URL:
 * 		- %server%/api/comment/update
 * Descript:
 *      - Update a comment
 * Method:
 *      - POST
 * Params:
 *      data: The comment data/text
 *      commentid: The comment id
 * Returns:
 *      - JSON mongo result
 */
var updateComment = "/comment/update";

/**
 * removeComment
 *
 * URL:
 * 		- %server%/api/comment/remove
 * Descript:
 *      - Remove a comment
 * Method:
 *      - POST
 * Params:
 *      pid: The post id to which the comment belongs to
 *      commentid: The comment id
 * Returns:
 *      - JSON mongo result
 */
var removeComment = "/comment/remove";

/**
 * sendGroupRequest
 *
 * URL:
 * 		- %server%/api/user/group/request/add
 * Descript:
 *      - Add a group request
 * Method:
 *      - POST
 * Params:
 *      uid: The user id
 *      groupName: The group name to join
 * Returns:
 *      - JSON mongo result
 */
var sendGroupRequest = "/user/group/request/add";

/**
 * removeGroupRequest
 *
 * URL:
 * 		- %server%/api/user/group/request/remove
 * Descript:
 *      - Remove a group request
 * Method:
 *      - POST
 * Params:
 *      uid: The user id
 *      groupName: The group name to remove teh request from
 * Returns:
 *      - JSON mongo result
 */
var removeGroupRequest = "/user/group/request/remove";

/**
 * sendFriendRequest
 *
 * URL:
 * 		- %server%/api/user/friend/request/add
 * Descript:
 *      - Add a friend request
 * Method:
 *      - POST
 * Params:
 *      uid: The user id
 *      fid: The friend id
 * Returns:
 *      - JSON mongo result
 */
var sendFriendRequest = "/user/friend/sent/add";

/**
 * removeFriendRequest
 *
 * URL:
 * 		- %server%/api/friends/remove/request
 * Descript:
 *      - Remove a friend request
 * Method:
 *      - POST
 * Params:
 *      uid: The user id
 *      fid: The friend id
 * Returns:
 *      - JSON mongo result
 */
var removeFriendRequest = "/friends/remove/request";

//==========================================================================================

router.get(findUserById, UserID, function (req, res, next) {
	DB.Users.findById(req, res, function (result) {
		res.json(result);
	});
});

router.get(findUser, UserID, function (req, res, next) {
	DB.Users.find(req, res, function (result) {
		res.json(result);
	});
});

/**
 * ??
 */
router.post(updateUser, UserID, function (req, res, next) {
	DB.Users.update(req, res, function (result) {
		res.json(result);
	});
});

//POST remove the user

router.post(deleteUser, UserID, function (req, res, next) {
	DB.Users.remove(req, res, function (result) {
		res.json(result);
	});
});

//POST register the user
/**
 * Register the user by HTMLForm.
 */
router.post(registerUser, UserID, function (req, res, next) {
	//Insert user with false auth into colUsers
	DB.Users.add(req, res, function (result) {
		res.json(result);
	});
});

//POST login user
router.post(loginUser, UserID, function (req, res, next) {
	DB.Users.login(req, res, function (result) {
		res.json(result);
	});
});

//GET list of friends from userId
router.get(findFriendsById, UserID, function (req, res, next) {
	DB.Friends.find(req, res, function (result) {
		res.json(result);
	});

});

router.post(addFriendReq, UserID, function (req, res, next) {
	DB.Friends.addRequest(req, res, function (result) {
		res.json(result);
	});
});

//GET get friend requests for a specified user
router.get(findFriendSent, UserID, function (req, res, next) {
	DB.Friends.findRequests(req, res, function (result) {
		res.json(result);
	});
});

//GET get recieved friend requests for a specified user
router.get(findFriendReceived, UserID, function (req, res, next) {
	DB.Friends.findRequests(req, res, function (result) {
		res.json(result);
	});
});

router.post(acceptFriendReq, UserID, function (req, res, next) {
	DB.Friends.acceptFriendReq(req, res, function (result) {
		res.json(result);
	});
});

//Removes friend request
router.post(denyFriendReq, UserID, function (req, res, next) {
	DB.Friends.denyFriendReq(req, res, function (result) {
		res.json(result);
	});
});

router.post(delFriend, UserID, function (req, res, next) {
	DB.Friends.remove(req, res, function (result) {
		res.json(result);
	});
});

//Create a group
router.post(createGroup, UserID, function (req, res, next) {
	DB.Groups.add(req, res, function (result) {
		res.json(result);
	});
});

//Remove a group
router.post(delGroup, UserID, function (req, res, next) {
	DB.Groups.remove(req, res, function (result) {
		res.json(result);
	});
});

//find groups by userid
router.get(findGroupsByID, UserID, function (req, res, next) {
	DB.Groups.findByUserId(req, res, function (result) {
		res.json(result);
	});
});

//Update a group
router.post(updateGroup, UserID, function (req, res, next) {
	DB.Groups.update(req, res, function (result) {
		res.json(result);
	});
});

//Add member to group
router.post(addGroupUser, UserID, function (req, res, next) {
	DB.Groups.add(req, res, function (result) {
		res.json(result);
	});
});

//Remove member from group
router.post(delGroupUser, UserID, function (req, res, next) {
	DB.GroupMembers.remove(req, res, function (result) {
		res.json(result);
	});
});

//Find members for group
router.get(findGroupUsers, UserID, function (req, res, next) {
	DB.GroupMembers.find(req, res, function (result) {
		res.json(result);
	});
});

//Add timeline post
router.post(addTimelinePost, UserID, function (req, res, next) {
	//Set type before pass to db
	req.body.origin = {
		type: 'timeline',
		id: req.body.origin
	};
	DB.Posts.add(req, res, UserID, function (result) {
		res.json(result);
	});
});
//Add group post
router.post(addGroupPost, UserID, function (req, res, next) {
	//Set type before pass to db
	req.body.origin = {
		type: 'group',
		id: req.body.origin
	};
	DB.Posts.add(req, res, UserID, function (result) {
		res.json(result);
	});
});

//Remove post
router.post(delPost, UserID, function (req, res, next) {
	DB.Posts.remove(req, res, function (result) {
		res.json(result);
	});
});

//Update post
router.post(updatePost, UserID, function (req, res, next) {
	DB.Posts.update(req, res, function (result) {
		res.json(result);
	});
});

router.get(findPostByUid, UserID, function (req, res, next) {
	DB.Posts.findByUserId(req, res, function (result) {
		res.json(result);
	});
});
router.get(findPostByPid, UserID, function (req, res, next) {
	DB.Posts.findByPostId(req, res, function (result) {
		res.json(result);
	});
});

router.get(suggestFriends, UserID, function (req, res, next) {
	DB.Friends.suggest(req, res, function (result) {
		res.json(result);
	});
});

router.get(findCourseById, UserID, function (req, res, next) {
	DB.Courses.findById(req, res, function (result) {
		res.json(result);
	});
});

router.get(findCourse, UserID, function (req, res, next) {
	DB.Courses.find(req, res, function (result) {
		res.json(result);
	});
});

router.post(createCourse, UserID, function (req, res, next) {
	DB.Courses.createCourse(req, res, function (result) {
		res.json(result);
	});
});

router.post(deleteCourse, UserID, function (req, res, next) {
	DB.Courses.delete(req, res, function (result) {
		res.json(result);
	});
});

router.post(updateCourse, UserID, function (req, res, next) {
	DB.Courses.update(req, res, function (result) {
		res.json(result);
	});
});

router.post(addCourseToUser, UserID, function (req, res, next) {
	DB.Courses.addToUser(req, res, function (result) {
		res.json(result);
	});
});

router.post(delCourseFromUser, UserID, function (req, res, next) {
	DB.Courses.removeFromUser(req, res, function (result) {
		res.json(result);
	});
});

router.get(findLostById, UserID, function (req, res, next) {
	DB.LostFound.findById(req, res, function (result) {
		res.json(result);
	});
});

router.get(findLost, UserID, function (req, res, next) {
	DB.LostFound.find(req, res, function (result) {
		res.json(result);
	});
});

router.post(addLost, UserID, function (req, res, next) {
	DB.LostFound.add(req, res, function (result) {
		res.json(result);
	});
});

router.post(removeLost, UserID, function (req, res, next) {
	DB.LostFound.remove(req, res, function (result) {
		res.json(result);
	});
});

router.post(updateLost, UserID, function (req, res, next) {
	DB.LostFound.update(req, res, function (result) {
		res.json(result);
	});
});

router.get(findGroupAdmins, UserID, function (req, res, next) {
	DB.GroupAdmins.find(req, res, function (result) {
		res.json(result);
	});
});

router.post(addGroupAdmin, UserID, function (req, res, next) {
	DB.GroupAdmins.add(req, res, function (result) {
		res.json(result);
	});
});

router.post(removeGroupAdmin, UserID, function (req, res, next) {
	DB.GroupAdmins.remove(req, res, function (result) {
		res.json(result);
	});
});

router.get(findCommentById, UserID, function (req, res, next) {
	DB.Comments.findByPostId(req, res, function (result) {
		res.json(result);
	});
});

router.post(addComment, UserID, function (req, res, next) {
	DB.Comments.add(req, res, function (result) {
		res.json(result);
	});
});

router.post(removeComment, UserID, function (req, res, next) {
	DB.Comments.removeById(req, res, function (result) {
		res.json(result);
	});
});

router.post(updateComment, UserID, function (req, res, next) {
	DB.Comments.update(req, res, function (result) {
		res.json(result);
	});
});

//GET get friend requests for a specified user
router.get(findGroupSent, UserID, function (req, res, next) {
	DB.Groups.findRequests(req, res, function (result) {
		res.json(result);
	});
});

//GET get recieved friend requests for a specified user
router.get(findGroupReceived, UserID, function (req, res, next) {
	DB.Groups.findRequest(req, res, function (result) {
		res.json(result);
	});
});

router.post(sendGroupRequest, UserID, function (req, res, next) {
	DB.Groups.addRequest(req, res, function (result) {
		res.json(result);
	});
});

router.post(removeGroupRequest, UserID, function (req, res, next) {
	DB.Groups.removeRequest(req, res, function (result) {
		res.json(result);
	});
});

router.post(addFriend, UserID, function (req, res, next) {
	DB.Friends.add(req, res, function (result) {
		res.json(result);
	});
});

router.post(removeFriendRequest, UserID, function (req, res, next) {
	DB.Friends.removeRequest(req, res, function (result) {
		res.json(result);
	});
});

router.get(loadMessages, UserID, function (req, res, next) {
	DB.Socket.loadMessages(req, res, function (err, result) {
		res.json(result);
	});
});

module.exports = router;