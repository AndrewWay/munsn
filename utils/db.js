var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var path = require('path');
var EMS = require('./ems');
var utils = require('./utils');

var dbURL = 'mongodb://localhost:27017/munsn';
/**
 * Max time a user has to authenticate
 */
var MAX_VALIDATE_MINUTES = 5;

//Collections
var collectionUsers; //Good
var collectionAuths; //Good
var collectionFriends; //Good
var collectionFriendRequests; //Good
var collectionGroups; //Good
var collectionGroupMembers; //Good
var collectionGroupAdmins; //TODO: John, EVALUATE
var collectionGroupRequests;
var collectionPosts; //TODO: John, EVALUATE
var collectionCalendar;
var collectionComments; //TODO: John, EVALUATE
var collectionCourses;
var collectionUserCourses;
var collectionGroupCourses;
var collectionLostFound;
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
		}
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

	DB.createCollection('gMembers', {
		validator: {
			$and: [{
				//Group _id
				_id: {
					$type: 'objectid'
				}
			}]
		}
	});

	DB.createCollection('gAdmins', {
		validator: {
			$and: [{
				//Group _id
				_id: {
					$type: 'objectid'
				}
			}]
		}
	});

	DB.createCollection('gRequests', {
		validator: {
			$and: [{
				userid: {
					$type: 'string'
				}
			}, {
				groupName: {
					$type: 'string'
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
					$type: 'object'
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
					timeStart: {
						$type: 'date'
					}
				},
				{
					timeEnd: {
						$type: 'date'
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
					year: {
						$type: 'string'
					}
				},
				{
					//Creatorid
					cid: {
						$type: 'string'
					}
				}
			]
		}
	});

	DB.createCollection('lostfound', {
		validator: {
			$and: [{
					name: {
						$type: 'string'
					}
				},
				{
					imagePath: {
						$type: 'string'
					}
				},
				{
					description: {
						$type: 'string'
					}
				},
				{
					long: {
						$type: 'string'
					}
				},
				{
					lat: {
						$type: 'string'
					}
				}
			]
		}
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
	collectionFriendRequests = DB.collection('fRequests');
	collectionGroups = DB.collection('groups');
	collectionGroupMembers = DB.collection('gMembers');
	collectionGroupAdmins = DB.collection('gAdmins');
	collectionGroupRequests = DB.collection('gRequests');
	collectionPosts = DB.collection('posts');
	collectionComments = DB.collection('comments');
	collectionCourses = DB.collection('courses');
	collectionLostFound = DB.collection('lost');
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
	require('./DB/posts')(DBPosts, collectionPosts);
	require('./DB/comments')(DBComments, collectionComments);
	require('./DB/courses')(DBCourses, collectionCourses, collectionUserCourses, collectionGroupCourses);
	require('./DB/lostfound')(DBLostFound, collectionLostFound);
	require('./DB/calendar')(DBCalendar, collectionCalendar);
	require('./DB/socket')(DBSocket, collectionSocket, collectionMessages);
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
	LostFound: DBLostFound,
	Socket: DBSocket,
	DB_URL: dbURL,
	MAX_VALIDATE_MINUTES: MAX_VALIDATE_MINUTES
};