var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var path = require('path');
var EMS = require('./ems');
var utils = require('./utils');

var dbURL = process.env.MONGO_URL || 'mongodb://localhost:27017/munsn';
/**
 * Max time a user has to authenticate
 */
var MAX_VALIDATE_MINUTES = 5;

//Collections
var collectionUsers;
var collectionAuths;
var collectionFriends;
var collectionFriendRequests;
var collectionGroups;
var collectionGroupMembers;
var collectionGroupRequests;
var collectionPosts;
var collectionCalendar;
var collectionComments;
var collectionCourses;
var collectionUserCourses;
var collectionGroupCourses;
var collectionSocket;
var collectionMessages;
var DBAuth = {};
var DBPosts = {};
var DBGroups = {};
var DBUsers = {};
var DBFriends = {};
var DBGroupMembers = {};
var DBGroupAdmins = {};
var DBComments = {};
var DBCourses = {};
var DBLostFound = {};
var DBCalendar = {};
var DBSocket = {};
var DBSearch = {};
//TODO: Devin, TESTING
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
					$regex: /@/
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
		}
	});

	DB.createCollection('friendRequests', {
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

	DB.createCollection('groups', {
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
				created: {
					$type: 'date'
				}
			}]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	DB.createCollection('groupMembers', {
		validator: {
			$and: [{
				//Group _id
				_id: {
					$type: 'objectId'
				}
			}]
		}
	});
	DB.createCollection('posts', {
		validator: {
			$and: [{
					uid: {
						$type: 'string'
					}
				},
				{
					type: {
						$type: 'string'
					}
				},
				{
					targetid: {
						$type: 'string'
					}
				},
				{
					visibility: {
						$type: 'string'
					}
				}, {
					"history.0": {
						$exists: true
					}
				}
			]
		}
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

	//The comments collection will most likely fail when using an array validator, commenting it out for now
	/*
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
	*/
	DB.createCollection('courses', {
		validator: {
			$and: [{
					label: {
						$type: 'string'
					}
				},
				{
					description: {
						$type: 'string'
					}
				},
				{
					name: {
						$type: 'string'
					}
				},
				{
					semester: {
						$type: 'string'
					}
				},
				{
					location: {
						$type: 'string'
					}
				},
				{
					department: {
						$type: 'string'
					}
				},
				{
					year: {
						$type: 'string'
					}
				},
				{
					//Creatorid
					cid: {
						$type: 'string'
					}
				},
				{
					event: {
						$type: 'object'
					}
				}
			]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	DB.createCollection('calendars', {
		validator: {
			$and: [{
				_id: {
					$type: 'string'
				},
				calendarid: {
					$type: 'string'
				}
				/*
				events: {
					$type: 'array'
				}
				*/
			}]
		}
	});

	DB.createCollection('socket', {
		validator: {
			$and: [{
				_id: {
					$type: 'string'
				},
				socketid: {
					$type: 'string'
				}
			}, ]
		},
		validationLevel: 'strict',
		validationAction: 'error'
	});

	/*
	TODO:
	There is another collection: collectionMessages
	It doesn't have a validator because its just arrays
	It has the following fields:
	- (array[string]) users: An array of the users who can access the messages
	- (array[string]) messages: An array of messages
	*/

	//Variables set to mongo collections
	collectionAuths = DB.collection('authkeys');
	collectionCalendar = DB.collection('calendars');
	collectionUsers = DB.collection('users');
	collectionFriends = DB.collection('friends');
	collectionFriendRequests = DB.collection('friendRequests');
	collectionGroups = DB.collection('groups');
	collectionGroupMembers = DB.collection('groupMembers');
	collectionGroupAdmins = DB.collection('groupAdmins');
	collectionGroupRequests = DB.collection('groupRequests');
	collectionPosts = DB.collection('posts');
	collectionComments = DB.collection('comments');
	collectionCourses = DB.collection('courses');
	collectionSocket = DB.collection('socket');
	collectionMessages = DB.collection('messages');
	collectionUserCourses = DB.collection('userCourses');
	collectionGroupCourses = DB.collection('groupCourses');
	require('./DB/users')(DBUsers, DBAuth, collectionUsers);
	require('./DB/auths')(DBAuth, collectionAuths, collectionUsers, MAX_VALIDATE_MINUTES);
	require('./DB/friends')(DBFriends, collectionFriends, collectionFriendRequests, collectionUsers);
	require('./DB/groups')(DBGroups, collectionGroups, collectionGroupMembers, collectionGroupAdmins, collectionGroupRequests, collectionUsers);
	require('./DB/admins')(DBGroupAdmins, collectionGroupAdmins);
	require('./DB/members')(DBGroupMembers, collectionGroupMembers);
	require('./DB/posts')(DBPosts, collectionPosts, collectionFriends);
	require('./DB/comments')(DBComments, collectionComments);
	require('./DB/courses')(DBCourses, collectionCourses, collectionUserCourses, collectionGroupCourses);
	require('./DB/calendar')(DBCalendar, collectionCalendar);
	require('./DB/socket')(DBSocket, collectionSocket, collectionMessages);
	require('./DB/search')(DBSearch, collectionUsers, collectionGroups, collectionCourses);
});


module.exports = {
	Auth: DBAuth,
	Calendar: DBCalendar,
	Posts: DBPosts,
	Groups: DBGroups,
	Users: DBUsers,
	Friends: DBFriends,
	GroupMembers: DBGroupMembers,
	GroupAdmins: DBGroupAdmins,
	Comments: DBComments,
	Courses: DBCourses,
	Socket: DBSocket,
	Search: DBSearch,
	DB_URL: dbURL,
	MAX_VALIDATE_MINUTES: MAX_VALIDATE_MINUTES
};