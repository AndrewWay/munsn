var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var DB_URL = 'mongodb://localhost:27017/db';
exports.DB_URL = DB_URL;

//Collections
var collectionUsers;
var collectionAuths;
var collectionFriends;
var collectionFriendRequests;

//Connect to the database
var DB = mongoClient.connect(DB_URL, function(err, DB) {
	assert.equal(null, err);
	console.log("Connected to mongo server: " + DB_URL);
    //Restricts and denies user documents so they have a user, email from mun.ca, and pass
    DB.createCollection("users", 
        {validator: 
            {$and: [{user: {$type: "string"}},
                    {pass: {$type: "string"}},
                    {email: {$type: /@mun\.ca$/}},
                    {auth: {$type: "bool"}},
                    {_id: {$type: "string"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    //Restricts and denies regauth documents so that there is an authkey
    DB.createCollection("regauths",
        {validator:
            {$and: [{authkey: {$type: "string"}},
                    {userId: {$type: "string"}},
                    {expiry: {$type: "number"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    //Restricts and denies friend documents so that there is from/to, and accepted
    DB.createCollection("friends",
        {validator:
            {$and: [{_id: {$type: "string"}},
                    {friends: {$type: "array"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    DB.createCollection("friendRequests",
        {validator:
            {$and: [{userId: {$type: "string"}},
                    {friendId: {$type: "string"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    //Variables set to mongo collections
    collectionAuths = DB.collection("regauths");
    collectionUsers = DB.collection("users");
    collectionFriends = DB.collection("friends");
    collectionFriendRequests = DB.collection("friendRequests");
});

//USERS
//======================================================================================================

//Insert one user into the user collection
exports.users_addUser = function(user, callback) {
    collectionUsers.insert(user, function(result) {
        callback(result);
    });
};

//Find a user by unique object id
exports.users_findUserById = function(id, callback) {
    collectionUsers.findOne({_id: id}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        //Returns null if error occured
        callback(result);
    });
};

//Find users matching query
exports.users_findUsers = function(query, callback) {
    collectionUsers.find(query).toArray(function(err, results) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(results);
        }
    });
};

//Updates the user
exports.users_updateUser = function(id, updates, callback) {
    collectionUsers.update({_id: id}, {$set: updates}, {upsert: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};

//Removes the user
exports.users_removeUser = function(id, callback) {
    collectionUsers.remove({_id: id}, {single: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};

//AUTH
//======================================================================================================

//Add an authkey to regauths
exports.auth_addAuthKey = function(userId, authkey, expiry, callback) {
    var regAuth = {
        userId: userId,
        authkey: authkey,
        expiry: expiry
    };
    collectionAuths.insert(regAuth, function(result) {
        callback(result);
    });
};

//Check for an existing authkey
exports.auth_findAuthKey = function(key, callback) {
    collectionAuths.findOne({authkey: key}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Delete authkey
exports.auth_deleteAuthKey = function(key, callback) {
    collectionAuths.remove({authkey: key}, {single: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};

//FRIENDS
//======================================================================================================

//Adds the friendId to the userId's friend list
exports.friends_addFriendToUser = function(userId, friendId, callback) {
    collectionFriends.update({_id: userId}, {$push: {friends: friendId}}, {upsert: true}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Finds all friends of a userId and returns it as an array
exports.friends_findAllFriendsForUser = function(userId, callback) {
    collectionFriends.find({_id: userId}, {"friends": true}).toArray(function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Removes the selected friendId from the specified userId
exports.friends_deleteFriendFromUser = function(userId, friendId, callback) {
    collectionFriends.update({_id: userId}, {$pull: {friends: friendId}}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};


//FRIEND REQUESTS
//======================================================================================================

//Add a friend request
exports.friendRequest_addRequest = function(userId, friendId, callback) {
    collectionFriendRequests.insert({userId: userId, friendId: friendId}, function(result) {
        callback(result);
    });
};

//Find all friend requests from a user
exports.friendRequest_findRequestsByUser = function(user, callback) {
    collectionFriendRequests.find({_id: user}).toArray(function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Remove friend request
exports.friendRequest_deleteRequest = function(userId, friendId, callback) {
    collectionFriendRequests.remove({userId: userId, friendId: friendId}, function(result) {
        callback(result);
    });
};