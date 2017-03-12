var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var path = require('path');
var EMS = require('./ems');

var DB_URL = 'mongodb://localhost:27017/db';
exports.DB_URL = DB_URL;

//Collections
var collectionUsers;
var collectionAuths;
var collectionFriends;
var collectionFriendRequests;
var collectionGroups;
var collectionGroupMembers;
var collectionPosts;
var collectionComments;

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

    DB.createCollection("groups",
        {validator:
            {$and: [{name: {$type: "string"}},
                    {creatorId: {$type: "string"}},
                    {dateCreated: {$type: "date"}}]},
        validationLevel: "strict",
    validationAction: "error"});

    DB.createCollection("posts",
        {validator:
            {$and: [{authorId: {$type: "string"}},
                    {dateCreated: {$type: "date"}},
                    {dataType: {$type: "string"}},
                    {data: {$type: "string"}}]},
        validationLevel: "strict",
    validationAction: "error"});

    //Variables set to mongo collections
    collectionAuths = DB.collection("regauths");
    collectionUsers = DB.collection("users");
    collectionFriends = DB.collection("friends");
    collectionFriendRequests = DB.collection("friendRequests");
    collectionGroups = DB.collection("groups");
    collectionGroupMembers = DB.collection("groupMembers");
    collectionPosts = DB.collection("posts");
    collectionComments = DB.collection("comments");
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
exports.auth_addAuthKey = function(user, authkey, expiry, callback) {
    var regAuth = {
        userId: user._id,
        authkey: authkey,
        expiry: expiry
    };
    collectionAuths.insert(regAuth, function(result) {
        callback(result);
    });
    //Send auth email to the user with the auth link
    EMS.sendAuthEmail(user, authkey, function(result) {
        console.log(result);
    });
};
exports.auth_updateAuthKey = function (user, authkey, expiry, callback) {
    var regAuth = {
        authkey: authkey,
        expiry: expiry
    };
    collectionAuths.update({userId: user._id}, {$set: regAuth}, {upsert: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
    EMS.resendAuthEmail(user, authkey, function(result) {
        console.log(result);
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
    collectionFriendRequests.insert({userId: userId, friendId: friendId}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Find all friend requests from a user
exports.friendRequest_findRequestsByUser = function(query, callback) {
    collectionFriendRequests.find(query).toArray(function(err, result) {
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

//GROUPS
//======================================================================================================

//Add a group
exports.group_addGroup = function(creatorId, name, callback) {
    var date = new Date();
    collectionGroups.insert({creatorId: creatorId, name: name, dateCreated: date}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Find a group by user
exports.group_findGroupsByUser = function(userId, callback) {
    collectionGroups.find({creatorId: userId}).toArray(function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Find group based on query
exports.group_findGroupsByQuery = function(query, callback) {
    collectionGroups.find(query, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Update group
exports.group_updateGroup = function(groupId, updates, callback) {
    collectionGroups.update({_id: groupId}, {$set: updates}, {upsert: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};

//Remove a group
exports.group_removeGroup = function(objectId, callback) {
    collectionGroups.remove({_id: objectId}, function(result) {
        callback(result);
    });
};


//GROUP MEMBERS
//======================================================================================================

//Add member to group
exports.groupMembers_addMember= function(groupId, memberId, callback) {
    collectionGroupMembers.update({_id: groupId}, {$push: {members: memberId}}, {upsert: true}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Finds all members of a group and returns it as an array
exports.groupMembers_findAllMembers = function(groupId, callback) {
    collectionGroupMembers.find({_id: groupId}, {"members": true}).toArray(function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Removes member from group
exports.groupMembers_removeMember = function(groupId, memberId, callback) {
    collectionGroupMembers.update({_id: groupId}, {$pull: {members: memberId}}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};


//POSTS
//======================================================================================================

//Add a post
exports.post_addPost = function(authorId, dataType, data, callback) {
    var date = new Date();
    collectionPosts.insert({authorId: authorId, dateCreated: date, dataType: dataType, data: data}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Remove a post
exports.post_removePost = function(objectId, callback) {
    collectionPosts.remove({_id: objectId}, function(result) {
        callback(result);
    });
};

//Get posts per user
exports.post_getPostsByUserId = function(userId, callback) {
    collectionPosts.find({authorId: userId}).toArray(function(err, results) {
        if (err) {
            console.warn(err);
        }
        callback(results);
    });
};

//Update post 
exports.post_updatePost = function(postId, updates, callback) {
    collectionPosts.update({_id: postId}, {$set: updates}, {upsert: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};


    collectionFriends.update({_id: userId}, {$push: {friends: friendId}}, {upsert: true}, function(err, result) {

//POST COMMENTS
//======================================================================================================

//Add a comment
exports.comment_addComment = function(postId, authorId, data, callback) {
    var date = new Date();
    var comment = {commentId: authorId + date.getTime(), authorId: authorId, dateCreated: dateCreated, dataHistory: [{data: data}] };
    collectionComments.update({_id: postId}, {$push: {comments: comment}}, {upsert: true}, function(err, result) {
        if (err) {
            console.warn(err);
        }
        callback(result);
    });
};

//Remove a comment using commentId
exports.comment_removeCommentByCommentId = function(postId, commentId, callback) {
    collectionComments.remove({_id: postId, comments: {commentId: commentId}}, function(result) {
        callback(result);
    });
};

//Get comments per postId
exports.comment_getCommentsByPostId = function(userId, callback) {
    collectionComments.find({authorId: userId}).toArray(function(err, results) {
        if (err) {
            console.warn(err);
        }
        callback(results);
    });
};

//Update comment 
exports.comment_updateComment = function(postId, updates, callback) {
    collectionComments.update({_id: postId}, {$set: updates}, {upsert: true}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};