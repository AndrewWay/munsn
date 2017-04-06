var express = require("express");
var router = express.Router();
var DB = require("../utils/db");
var EMS = require("../utils/ems");
var utils = require("../utils/utils");
var UserID = require("../middleware/functions").UserID;
/**
 * session
 *
 * URL:
 * 		- %server%/api/session
 * Description:
 *      - Gets the current session for this instance
 * Method:
 *      - GET
 * Params:
 *      - NONE
 * Returns:
 *      - JSON session object
 */
var session = "/session";
/**
 * loginUser
 *
 * URL:
 * 		- %server%/api/login
 * Description:
 *      - Logs user into the site
 * Method:
 *      - POST
 * Params:
 *      - uid: User's id
 *      - pass: User's password
 * Returns:
 *      - JSON user
 */
var loginUser = "/login";
/**
 * loginUser
 *
 * URL:
 * 		- %server%/api/logout
 * Description:
 *      - Logs the user out of the site
 * Method:
 *      - GET
 * Params:
 *      - NONE
 * Returns:
 *      - JSON user
 */
var logoutUser = "/logout";
/**
 * loadMessages
 *
 * URL:
 * 		- %server%/api/messages/load/
 * Description:
 *      - Get messages from a conversation
 * Method:
 *      - GET
 * Params:
 *      - uid1: The first user id
 * 		- uid2: The second user id
 * Returns:
 *      - JSON array containing messages
 */
var loadMessages = "/messages"; //GET
/**
 * findUserByUID
 *
 * URL:
 * 		- %server%/api/user/:uid
 * Description:
 *      - Gets the user object from the database if they exist
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get
 * Returns:
 *      - JSON user object
 */
var findUserByUID = "/user/:uid"; //GET
/**
 * findUser
 *
 * URL:
 * 		- %server%/api/user
 * Description:
 *      - Gets the user object with a query
 * Method:
 *      - GET
 * Params:
 *      - query: Various parameters
 * Returns:
 *      - JSON user object
 */
var findUser = "/user"; //GET
/**
 * updateUser
 *
 * URL:
 * 		- %server%/api/user/:uid
 * Description:
 *      - Updates an user's fields
 * Method:
 *      - PATCH
 * Params:
 *      - uid: The user id
 * 		- email: The email address
 * 		- pass: The password
 * Returns:
 *      - JSON updated user object
 */
var updateUser = "/user/:uid"; //PATCH
/**
 * deleteUser
 *
 * URL:
 * 		- %server%/api/user/:uid
 * Description:
 *      - Deletes a user from the server
 * Method:
 *      - DELETE
 * Params:
 *      - uid: The user id
 * Returns:
 *      - JSON user object before deletion
 */
var deleteUser = "/user/:uid"; //DELETE
/**
 * registerUser
 *
 * URL:
 * 		- %server%/api/register
 * Description:
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
var registerUser = "/register"; //POST
/**
 * addFriend
 *
 * URL:
 * 		- %server%/api/friend
 * Description:
 *      - Add a friend
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to delete the friend from
 * 		- fid: The friend id to delete the friendship from
 * Returns:
 *      - Mongo result
 */
var addFriend = "/friend"; //POST
/**
 * delFriend
 *
 * URL:
 * 		- %server%/api/friend
 * Description:
 *      - Delete a friend
 * Method:
 *      - DELETE
 * Params:
 *      - uid: The user id to delete the friend from
 * 		- fid: The friend id to delete the friendship from
 * Returns:
 *      - Mongo result
 */

var delFriend = "/friend"; //DELETE
/**
 * addFriendReq
 *
 * URL:
 * 		- %server%/api/friend/request
 * Description:
 *      - Send a friend request from one user to another
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to send the request from
 * 		- fid: The friend id to send the request to
 * Returns:
 *      - JSON friend request object
 */
var addFriendReq = "/friend/request"; //POST
/**
 * removeFriendRequest
 *
 * URL:
 * 		- %server%/api/friend/request
 * Description:
 *      - Remove a friend request
 * Method:
 *      - DELETE
 * Params:
 *      uid: The user id
 *      fid: The friend id
 * Returns:
 *      - JSON mongo result
 */
var removeFriendRequest = "/friend/request"; //DELETE
/**
 * acceptFriendReq
 *
 * URL:
 * 		- %server%/api/friend/request/accept
 * Description:
 *      - Accept a friend request
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to accept the request from (reciever)
 * 		- fid: The friend id to accept the request to (sender)
 * Returns:
 *      - JSON friend request object after deletion
 */
var acceptFriendReq = "/friend/request/accept"; //POST
/**
 * delFriendReq
 *
 * URL:
 * 		- %server%/api/friend/request/deny
 * Description:
 *      - Delete a friend request from one user to another
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id to delete the request from (reciever)
 * 		- fid: The friend id to delete the request to (sender)
 * Returns:
 *      - JSON friend request object after deletion
 */
var denyFriendReq = "/friend/request/deny"; //POST
/**
 * suggestFriends
 *
 * URL:
 * 		- %server%/api/friend/suggest/:uid
 * Description:
 *      - Get a list of suggested friends
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * 		- limit: The amount of suggested friends to return
 * Returns:
 *      - JSON user object array
 */
var suggestFriends = "/friend/suggest/:uid"; //GET
/**
 * findFriendsById
 *
 * URL:
 * 		- %server%/api/friends/:uid
 * Description:
 *      - Gets the friends for a given uid
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get
 * Returns:
 *      - JSON array containing user objects
 */
var findFriendsById = "/friends/:uid"; //GET
/**
 * findFriendSent
 *
 * URL:
 * 		- %server%/api/friend/sent/:uid
 * Description:
 *      - Gets the friend requests sent from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests sent from
 * Returns:
 *      - JSON array containing friend request objects
 */
var findFriendSent = "/friend/sent/:uid"; //GET
/**
 * findFriendReceived
 *
 * URL:
 * 		- %server%/api/friend/received/:fid
 * Description:
 *      - Gets the friend requests recieved from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests recieved from
 * Returns:
 *      - JSON array containing friend request objects
 */
var findFriendReceived = "/friend/received/:fid"; //GET
/**
 * createCourse
 *
 * URL:
 * 		- %server%/api/course
 * Description:
 *      - Create a course
 * Method:
 *      - POST
 * Params:
 *		label: Shorthand name, ex. "COMP 4770"
 *		name: Full name, ex. "Team Project"
 *		Descriptionion: Descriptionion
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
var createCourse = "/course"; //POST
/**
 * updateCourse
 *
 * URL:
 * 		- %server%/api/course
 * Description:
 *      - Update a course
 * Method:
 *      - PATCH
 * Params:
 *		_id: The course unique object id
 *		label: Shorthand name, ex. "COMP 4770"
 *		Descriptionion: Descriptionion of the course
 *		name: Full name, ex. "Team Project"
 *		semester: Semester, ex. "winter"
 *		location: Room number, ex. "EN 1051"
 *		department: Department that the course belongs to, ex. "cs"
 *		year: Current year the course is offered
 *		cid: Creator id
 *		event: The calendar event object that relates to the google api
 * Returns:
 *      - JSON mongo result
 */
var updateCourse = "/course"; //PATCH
/**
 * removeCourse
 *
 * URL:
 * 		- %server%/api/course
 * Description:
 *      - Remove a course
 * Method:
 *      - DELETE
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var deleteCourse = "/course"; //DELETE
/**
 * addCourseToUser
 *
 * URL:
 * 		- %server%/api/course/user
 * Description:
 *      - Add a course to a user
 * Method:
 *      - PUT
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var addCourseToUser = "/course/user"; //PUT
/**
 * delCourseFromUser
 *
 * URL:
 * 		- %server%/api/course/user
 * Description:
 *      - Delete a course from a user
 * Method:
 *      - DELETE
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var delCourseFromUser = "/course/user"; //DELETE
/**
 * addCourseToGroup
 *
 * URL:
 * 		- %server%/api/course/group
 * Description:
 *      - Add a course to a Group
 * Method:
 *      - PUT
 * Params:
 *		_id: The groups unique object id
 		cid: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var addCourseToGroup = "/course/group"; //PUT
/**
 * delCourseFromGroup
 *
 * URL:
 * 		- %server%/api/course/group
 * Description:
 *      - Delete a course from a Group
 * Method:
 *      - DELETE
 * Params:
 *		_id: The course unique object id
 * Returns:
 *      - JSON mongo result
 */
var delCourseFromGroup = "/course/group"; //DELETE
/**
 * findCoursesByUID
 *
 * URL:
 * 		- %server%/api/course/:uid
 * Description:
 *      - Get courses by UseriD
 * Method:
 *      - GET
 * Params:
 *      - uid: The course id
 * Returns:
 *      - JSON course object
 */
var findCoursesByUID = "/course/:uid"; //GET
/**
 * findCourse
 *
 * URL:
 * 		- %server%/api/course
 * Description:
 *      - Get a course based on query
 * Method:
 *      - GET
 * Params:
 *		_id: The course unique object id
 *		label: Shorthand name, ex. "COMP 4770"
 *		name: Full name, ex. "Team Project"
 *		Descriptionion: Descriptionion
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
var findCourse = "/course"; //GET
/**
 * addLostFound
 *
 * URL:
 * 		- %server%/api/lostfound
 * Description:
 *      - Add a Lost
 * Method:
 *      - POST
 * Params:
 *		imagePath: The path to an image if supplied
 *		Descriptionion: Descriptionion
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON mongo result
 */
var addLostFound = "/lostfound"; //POST
/**
 * updateLostFound
 *
 * URL:
 * 		- %server%/api/lostfound
 * Description:
 *      - Update a Lost
 * Method:
 *      - PATCH
 * Params:
 *		_id: The lost unique object id
 *		imagePath: The path to an image if supplied
 *		Descriptionion: Descriptionion
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON mongo result
 */
var updateLostFound = "/lostfound"; //PATCH
/**
 * removeLostFound
 *
 * URL:
 * 		- %server%/api/lost
 * Description:
 *      - Remove a Lost
 * Method:
 *      - DELETE
 * Params:
 *		_id: The Lost unique object id
 * Returns:
 *      - JSON mongo result
 */
var removeLostFound = "/lostfound"; //DELETE
/**
 * findLostById
 *
 * URL:
 * 		- %server%/api/lostfound/:uid
 * Description:
 *      - Get a course by id
 * Method:
 *      - GET
 * Params:
 *      - uid: The lost id
 * Returns:
 *      - JSON lost object
 */
var findLostFoundById = "/lostfound/:uid"; //GET
/**
 * findLost
 *
 * URL:
 * 		- %server%/api/lostfound
 * Description:
 *      - Get a lost based on query
 * Method:
 *      - GET
 * Params:
 *		_id: The lost unique object id
 *		imagePath: The path to an image if supplied
 *		Descriptionion: Descriptionion
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON lost object array
 */
var findLostFound = "/lostfound"; //GET
/**
 * addTimelinePost
 *
 * URL:
 * 		- %server%/api/post/timeline
 * Description:
 *      - Add a user timeline post
 * Method:
 *      - POST
 * Params:
 *      - uid: The authors id
 * 		- targetid: The groupid
 * 		- type: Should be 'timeline'
 *		- visibility: Can be 'public', 'friends', 'private'
 *		- whitelist: Who can absolutely see this post in all cases of visibility
 * 		- fields: The data that is stored in this post
 */
var addTimelinePost = "/post/timeline"; //POST
/**
 * addGroupPost
 *
 * URL:
 * 		- %server%/api/post/group
 * Description:
 *      - Add a group post
 * Method:
 *      - POST
 * Params:
 *      - uid: The authors id
 * 		- targetid: The groupid
 * 		- type: Should be 'group'
 *		- visibility: Can be 'public', 'friends', 'private'
 *		- whitelist: Who can absolutely see this post in all cases of visibility
 * 		- fields: The data that is stored in this post
 */
var addGroupPost = "/post/group"; //POST
/**
 * delPost
 *
 * URL:
 * 		- %server%/api/post
 * Description:
 *      - Delete a post
 * Method:
 *      - DELETE
 * Params:
 *      - pid: The post id
 * Returns:
 *      - JSON mongo result
 */
var deletePost = "/post"; //DELETE
/**
 * updatePost
 *
 * URL:
 * 		- %server%/api/post
 * Description:
 *      - Update a post
 * Method:
 *      - PATCH
 * Params:
 * 		- data: Actual data
 * Returns:
 *      - JSON mongo result
 */
var updatePostVisibility = "/post"; //PATCH
/**
 * updatePostHistory
 *
 * URL:
 * 		- %server%/api/post/history
 * Description:
 *      - Update a post
 * Method:
 *      - PATCH
 * Params:
 * 		- data: Actual data
 * Returns:
 *      - JSON mongo result
 */
var updatePostHistory = "/post/history"; //PATCH
/**
 * findPost
 *
 * URL:
 * 		- %server%/api/post
 * Description:
 *      - Get a singular post by PostID
 * Method:
 *      - GET
 * Params:
 *      - pid: The post id
 *		- visibility: The visibility of a post
 *		- targetid: The id that this post was made on
 *		- uid: The user who made this post
 *		- type: The type of post; (this is should be included when searching by targetid)
 *		- whitelist: Probably doesn't work currently
 *
 * Returns:
 *      - JSON mongo result
 */
var findPost = "/post"; //GET
/**
 * findPostByUid
 *
 * URL:
 * 		- %server%/api/post/:uid
 * Description:
 *      - Get ALL posts by UserID
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * Returns:
 *      - JSON mongo result
 */
var findPostByUID = "/post/:uid"; //GET
/**
 * findTimelinePosts
 *
 * URL:
 * 		- %server%/api/post/timeline
 * Description:
 *      - Get all relavent posts to the user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * //TODO:
 * 		- targetid: Not yet implemented
 * Returns:
 *      - JSON mongo result
 */
var findTimelinePosts = "/posts/timeline"; //GET
/**
 * addComment
 *
 * URL:
 * 		- %server%/api/comment
 * Description:
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
var addComment = "/comment"; //POST
/**
 * updateComment
 *
 * URL:
 * 		- %server%/api/comment
 * Description:
 *      - Update a comment
 * Method:
 *      - PATCH
 * Params:
 *      data: The comment data/text
 *      commentid: The comment id
 * Returns:
 *      - JSON mongo result
 */
var updateComment = "/comment"; //PATCH
/**
 * removeComment
 *
 * URL:
 * 		- %server%/api/comment
 * Description:
 *      - Remove a comment
 * Method:
 *      - DELETE
 * Params:
 *      pid: The post id to which the comment belongs to
 *      commentid: The comment id
 * Returns:
 *      - JSON mongo result
 */
var removeComment = "/comment"; //DELETE
/**
 * findCommentById
 *
 * URL:
 * 		- %server%/api/comment/:uid
 * Description:
 *      - Get comments by user id
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id
 * Returns:
 *      - JSON array containing comment objects
 */
var findCommentByUID = "/comment/:uid"; //GET
/**
 * createGroup
 *
 * URL:
 * 		- %server%/api/group
 * Description:
 *      - Create a group
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id that is creating the group
 * 		- name: The group name
 * Returns:
 *      - JSON group object after creation
 */
var createGroup = "/group"; //POST
/**
 * delGroup
 *
 * URL:
 * 		- %server%/api/group/:gid
 * Description:
 *      - Delete a group
 * Method:
 *      - DELETE
 * Params:
 *      - gid: The group id to be deleted
 * Returns:
 *      - JSON group object after deletion
 */
var delGroup = "/group/:gid"; //DELETE
/**
 * updateGroup
 *
 * URL:
 * 		- %server%/api/group
 * Description:
 *      - Update a group
 * Method:
 *      - PATCH
 * Params:
 *      - gid: The group id to be updated
 * 		- name: The group name
 * 		- descrip: The group Descriptionion
 * Returns:
 *      - JSON group object after update
 */
var updateGroup = "/group"; //PATCH
/**
 * findGroups
 *
 * URL:
 * 		- %server%/api/group
 * Description:
 *      - Search groups by query
 * Method:
 *      - GET
 * Params:
 *      - _id: The group object unique id
 * 		- name: The group name
 * 		- creatorid: The group creator's id
 * 		- ownerid: The owners id
 * 		- created: The creation date
 * Returns:
 *      - JSON array containing group objects
 */
var findGroups = "/group"; //GET
/**
 * findGroupById
 *
 * URL:
 * 		- %server%/api/group/:gid
 * Description:
 *      - Gets group from a group id
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id
 * Returns:
 *      - JSON group object
 */
var findGroupById = "/group/:gid"; //GET
/**
 * findGroupSent
 *
 * URL:
 * 		- %server%/api/groups/sent/:uid
 * Description:
 *      - Gets the group requests sent from a user
 * Method:
 *      - GET
 * Params:
 *      - uid: The user id to get requests sent from
 * Returns:
 *      - JSON array containing group request objects
 */
var findGroupSent = "/groups/sent/:uid"; //GET
/**
 * findGroupReceived
 *
 * URL:
 * 		- %server%/api/groups/received/:gid
 * Description:
 *      - Gets the group requests recieved for a group
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id to get requests recieved from
 * Returns:
 *      - JSON array containing group request objects
 */
var findGroupReceived = "/groups/received/:gid"; //GET
/**
 * findUserGroups
 *
 * URL:
 * 		- %server%/api/groups/user/:uid
 * Description:
 *      - Get groups that the user is in
 * Method:
 *      - GET
 * Params:
 *      - uid: The first user id
 * Returns:
 *      - JSON array containing group ids
 */
var findGroupsByUID = "/groups/user/:uid"; //GET
/**
 * findGroupRequests
 *
 * URL:
 * 		- %server%/api/groups/requests/:gid
 * Description:
 *      - Get group requests for a group
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id
 * Returns:
 *      - JSON array containing group requests
 */
var findGroupRequests = "/groups/requests/:gid"; //GET
/**
 * addGroupUser
 *
 * URL:
 * 		- %server%/api/groups/user
 * Description:
 *      - Add a user to a group
 * Method:
 *      - POST
 * Params:
 *      - gid: The group id
 * 		- uid: The user id to be added
 * Returns:
 *      - JSON group users object after creation
 */
var addGroupUser = "/groups/user"; //POST
/**
 * delGroupUser
 *
 * URL:
 * 		- %server%/api/groups/user
 * Description:
 *      - Delete a user from a group
 * Method:
 *      - DELETE
 * Params:
 *      - gid: The group id
 * 		- uid: The user id to be deleted
 * Returns:
 *      - JSON group users object after deletion
 */
var delGroupUser = "/groups/user"; //DELETE
/**
 * updateGroupUser
 *
 * URL:
 * 		- %server%/api/groups/user
 * Description:
 *      - Updates a user in a group
 * Method:
 *      - PATCH
 * Params:
 *      - gid: The group id
 * 		- uid: The user id to be updated
 *      - admin: true/dalse if user should be admin
 * Returns:
 *      - JSON group users object after deletion
 */
var updateGroupUser = "/groups/user"; //PATCH
/**
 * findGroupMembers
 *
 * URL:
 * 		- %server%/api/groups/members/:gid
 * Description:
 *      - Remove a group request
 * Method:
 *      - GET
 * Params:
 *      uid: The user id
 *      groupName: The group name to remove teh request from
 * Returns:
 *      - JSON mongo result
 */
var findGroupMembers = "/groups/members/:gid"; //GET
/**
 * findGroupsAdmins
 *
 * URL:
 * 		- %server%/api/groups/admins/:gid
 * Description:
 *      - Gets all admins in a group
 * Method:
 *      - GET
 * Params:
 *      - gid: The group id to get admins from
 * Returns:
 *      - JSON array containing user objects
 */
var findGroupAdmins = "/groups/admins/:gid"; //GET
/**
 * addGroupAdmin
 *
 * URL:
 * 		- %server%/api/groups/admins
 * Description:
 *      - Add an admin
 * Method:
 *      - POST
 * Params:
 *		imagePath: The path to an image if supplied
 *		Descriptionion: Descriptionion
 *		long: Longitude
 *		lat: Latitude
 * Returns:
 *      - JSON mongo result
 */
var addGroupAdmin = "/groups/admins"; //POST
/**
 * removeGroupAdmin
 *
 * URL:
 * 		- %server%/api/groups/admins
 * Description:
 *      - Remove an admin
 * Method:
 *      - DELETE
 * Params:
 *		_id: The admin unique object id
 * Returns:
 *      - JSON mongo result
 */
var removeGroupAdmin = "/groups/admins"; //DELETE
/**
 * acceptGroupReq
 *
 * URL:
 * 		- %server%/api/groups/request/accept
 * Description:
 *      - Accept a group request
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id
 * 		- gid: The group id
 * Returns:
 *      - JSON group request object
 */
var acceptGroupReq = "/groups/request/accept"; //POST
/**
 * denyGroupReq
 *
 * URL:
 * 		- %server%/api/groups/request/deny
 * Description:
 *      - Delete a group request
 * Method:
 *      - POST
 * Params:
 *      - uid: The user id
 * 		- gid: The group id
 * Returns:
 *      - JSON friend request object after deletion
 */
var denyGroupReq = "/groups/request/deny"; //POST
/**
 * sendGroupRequest
 *
 * URL:
 * 		- %server%/api/groups/request
 * Description:
 *      - Add a group request
 * Method:
 *      - POST
 * Params:
 *      uid: The user id
 *      groupName: The group name to join
 * Returns:
 *      - JSON mongo result
 */
var sendGroupRequest = "/groups/request"; //POST
/**
 * removeGroupRequest
 *
 * URL:
 * 		- %server%/api/groups/request
 * Description:
 *      - Remove a group request
 * Method:
 *      - DELETE
 * Params:
 *      uid: The user id
 *      groupName: The group name to remove teh request from
 * Returns:
 *      - JSON mongo result
 */
var removeGroupRequest = "/groups/request"; //DELETE
/**
 * search
 *
 * URL:
 * 		- %server%/api/search
 * Description:
 *      - Search through users, groups, and courses
 * Method:
 *      - DELETE
 * Params:
 *      - query:
 *          - In users: Searchs first/last names
 *          - In groups: Searchs group names
 *          - In courses: Searchs labels and names
 * Returns:
 *      - JSON mongo result
 */
var search = "/search"; //GET

//==========================================================================================
router.get(session, function (req, res, next) {
	res.json(req.session);
});
router.post(loginUser, UserID, function (req, res, next) {
	DB.Users.login(req, res, function (result) {
		res.json(result);
	});
});
router.get(logoutUser, function (req, res, next) {
	DB.Users.logout(req, res, function (result) {
		res.redirect('../');
	});
});
router.get(loadMessages, UserID, function (req, res, next) {
	DB.Socket.loadMessages(req, res, function (result) {
		res.json(result);
	});
});
router.get(findUserByUID, UserID, function (req, res, next) {
	DB.Users.findById(req, res, function (result) {
		res.json(result);
	});
});
router.get(findUser, UserID, function (req, res, next) {
	DB.Users.find(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updateUser, UserID, function (req, res, next) {
	DB.Users.update(req, res, function (result) {
		res.json(result);
	});
});
router.delete(deleteUser, UserID, function (req, res, next) {
	DB.Users.remove(req, res, function (result) {
		res.json(result);
	});
});
router.post(registerUser, UserID, function (req, res, next) {
	//Insert user with false auth into colUsers
	DB.Users.add(req, res, function (result) {
		res.json(result);
	});
});
router.post(addFriend, UserID, function (req, res, next) {
	DB.Friends.add(req, res, function (result) {
		res.json(result);
	});
});
router.delete(delFriend, UserID, function (req, res, next) {
	DB.Friends.remove(req, res, function (result) {
		res.json(result);
	});
});
router.post(addFriendReq, UserID, function (req, res, next) {
	DB.Friends.addRequest(req, res, function (result) {
		res.json(result);
	});
});
router.delete(removeFriendRequest, UserID, function (req, res, next) {
	DB.Friends.removeRequest(req, res, function (result) {
		res.json(result);
	});
});
router.post(acceptFriendReq, UserID, function (req, res, next) {
	DB.Friends.acceptFriendReq(req, res, function (result) {
		res.json(result);
	});
});
router.post(denyFriendReq, UserID, function (req, res, next) {
	DB.Friends.denyFriendReq(req, res, function (result) {
		res.json(result);
	});
});
router.get(suggestFriends, UserID, function (req, res, next) {
	DB.Friends.suggest(req, res, function (result) {
		res.json(result);
	});
});
router.get(findFriendsById, UserID, function (req, res, next) {
	DB.Friends.find(req, res, function (result) {
		res.json(result);
	});

});
router.get(findFriendSent, UserID, function (req, res, next) {
	DB.Friends.findRequests(req, res, function (result) {
		res.json(result);
	});
});
router.get(findFriendReceived, UserID, function (req, res, next) {
	DB.Friends.findRequests(req, res, function (result) {
		res.json(result);
	});
});
router.post(createCourse, UserID, function (req, res, next) {
	DB.Courses.add(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updateCourse, UserID, function (req, res, next) {
	DB.Courses.update(req, res, function (result) {
		res.json(result);
	});
});
router.delete(deleteCourse, UserID, function (req, res, next) {
	DB.Courses.delete(req, res, function (result) {
		res.json(result);
	});
});
router.put(addCourseToUser, UserID, function (req, res, next) {
	DB.Courses.addToUser(req, res, function (result) {
		res.json(result);
	});
});
router.delete(delCourseFromUser, UserID, function (req, res, next) {
	DB.Courses.removeFromUser(req, res, function (result) {
		res.json(result);
	});
});
router.put(addCourseToGroup, UserID, function (req, res, next) {
	DB.Courses.addToGroup(req, res, function (result) {
		res.json(result);
	});
});
router.delete(delCourseFromGroup, UserID, function (req, res, next) {
	DB.Courses.removeFromGroup(req, res, function (result) {
		res.json(result);
	});
});
router.get(findCoursesByUID, UserID, function (req, res, next) {
	DB.Courses.findByUserID(req, res, function (result) {
		res.json(result);
	});
});
router.get(findCourse, UserID, function (req, res, next) {
	DB.Courses.find(req, res, function (result) {
		res.json(result);
	});
});
router.post(addLostFound, UserID, function (req, res, next) {
	DB.LostFound.add(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updateLostFound, UserID, function (req, res, next) {
	DB.LostFound.update(req, res, function (result) {
		res.json(result);
	});
});
router.delete(removeLostFound, UserID, function (req, res, next) {
	DB.LostFound.remove(req, res, function (result) {
		res.json(result);
	});
});
router.get(findLostFoundById, UserID, function (req, res, next) {
	DB.LostFound.findById(req, res, function (result) {
		res.json(result);
	});
});
router.get(findLostFound, UserID, function (req, res, next) {
	DB.LostFound.find(req, res, function (result) {
		res.json(result);
	});
});
router.post(addTimelinePost, UserID, function (req, res, next) {
	req.body.type = req.body.type || 'timeline';
	DB.Posts.add(req, res, function (result) {
		res.json(result);
	});
});
router.post(addGroupPost, UserID, function (req, res, next) {
	req.body.type = req.body.type || 'group';
	DB.Posts.add(req, res, function (result) {
		res.json(result);
	});
});
router.delete(deletePost, UserID, function (req, res, next) {
	DB.Posts.remove(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updatePostVisibility, UserID, function (req, res, next) {
	DB.Posts.updateVisibility(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updatePostHistory, UserID, function (req, res, next) {
	DB.Posts.updateHistory(req, res, function (result) {
		res.json(result);
	});
});
router.get(findPost, UserID, function (req, res, next) {
	DB.Posts.find(req, res, function (result) {
		res.json(result);
	});
});
router.get(findPostByUID, UserID, function (req, res, next) {
	DB.Posts.findByUserId(req, res, function (result) {
		res.json(result);
	});
});
router.get(findTimelinePosts, UserID, function (req, res, next) {
	DB.Posts.findTimelinePosts(req, res, function (result) {
		res.json(result);
	});
});
router.post(addComment, UserID, function (req, res, next) {
	DB.Posts.addComment(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updateComment, UserID, function (req, res, next) {
	DB.Comments.update(req, res, function (result) {
		res.json(result);
	});
});
router.delete(removeComment, UserID, function (req, res, next) {
	DB.Posts.removeComment(req, res, function (result) {
		res.json(result);
	});
});
router.get(findCommentByUID, UserID, function (req, res, next) {
	DB.Comments.findByPostId(req, res, function (result) {
		res.json(result);
	});
});
router.post(createGroup, UserID, function (req, res, next) {
	DB.Groups.add(req, res, function (result) {
		res.json(result);
	});
});
router.delete(delGroup, UserID, function (req, res, next) {
	DB.Groups.remove(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updateGroup, UserID, function (req, res, next) {
	DB.Groups.update(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroups, UserID, function (req, res, next) {
	DB.Groups.find(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroupById, UserID, function (req, res, next) {
	DB.Groups.findByGroupID(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroupSent, UserID, function (req, res, next) {
	DB.Groups.findRequests(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroupReceived, UserID, function (req, res, next) {
	DB.Groups.findRequest(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroupsByUID, UserID, function (req, res, next) {
	DB.Groups.findByUserID(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroupRequests, UserID, function (req, res, next) {
	DB.Groups.findRequests(req, res, function (result) {
		res.json(result);
	});
});
router.post(addGroupUser, UserID, function (req, res, next) {
	DB.Groups.add(req, res, function (result) {
		res.json(result);
	});
});
router.delete(delGroupUser, UserID, function (req, res, next) {
	DB.Groups.removeMember(req, res, function (result) {
		res.json(result);
	});
});
router.patch(updateGroupUser, UserID, function (req, res, next) {
	DB.Groups.updateMember(req, res, function (result) {
		res.json(result);
	});
});
router.get(findGroupMembers, UserID, function (req, res, next) {
	DB.Groups.findMembers(req, res, function (result) {
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
router.delete(removeGroupAdmin, UserID, function (req, res, next) {
	DB.GroupAdmins.remove(req, res, function (result) {
		res.json(result);
	});
});
router.post(acceptGroupReq, UserID, function (req, res, next) {
	DB.Groups.acceptGroupReq(req, res, function (result) {
		res.json(result);
	});
});
router.post(denyGroupReq, UserID, function (req, res, next) {
	DB.Groups.denyGroupReq(req, res, function (result) {
		res.json(result);
	});
});
router.post(sendGroupRequest, UserID, function (req, res, next) {
	DB.Groups.sendRequest(req, res, function (result) {
		res.json(result);
	});
});
router.delete(removeGroupRequest, UserID, function (req, res, next) {
	DB.Groups.removeRequest(req, res, function (result) {
		res.json(result);
	});
});
router.get(search, UserID, function (req, res, next) {
	DB.Search.search(req, res, function (result) {
		res.json(result);
	});
});


module.exports = router;