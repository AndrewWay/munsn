var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var dbURL = 'mongodb://localhost:27017/db';
exports.dbURL = dbURL;

//Collections
var colUser;
var colRegAuth;
var colFriend;

//Connect to the database
var db = mongoClient.connect(dbURL, function(err, db) {
	assert.equal(null, err);
	console.log("Connected to mongo server: " + dbURL);
    //Restricts and denies user documents so they have a user, email from mun.ca, and pass
    db.createCollection("users", 
        {validator: 
            {$and: [{user: {$type: "string"}},
                    {pass: {$type: "string"}},
                    {email: {$type: /@mun\.ca$/}},
                    {auth: {$type: "bool"}},
                    {_id: {$type: "string"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    //Restricts and denies regauth documents so that there is an authkey
    db.createCollection("regauths",
    {validator:
        {$and: [{authkey: {$type: "string"}},
                {userId: {$type: "string"}},
                {expiry: {$type: "number"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    //Restricts and denies friend documents so that there is from/to, and accepted
    db.createCollection("friends",
    {validator:
        {$and: [{from: {$type: "string"}},
                {to: {$type: "string"}},
                {accepted: {$type: "bool"}}]},
        validationLevel: "strict",
        validationAction: "error"});

    //Variables set to mongo collections
    colRegAuth = db.collection("regauths");
    colUser = db.collection("users");
    colFriend = db.collection("friends");
});

//USERS
//======================================================================================================

//Insert one user into the user collection
exports.insertUser = function(user, callback) {
    colUser.insert(user, function(result) {
        callback(result);
    });
};

//Find a user by unique object id
exports.findUserById = function(id, callback) {
    colUser.find({_id: id}).limit(1).toArray(function(err, users) {
        callback(users[0]);
    });
};

//Updates the user
exports.updateUser = function(id, updates, callback) {
    colUser.update({_id: id}, {$set: updates}, function(err, obj) {
        if (err) {
            console.warn(err);
        }
        else {
            callback(obj.result);
        }
    });
};

//Removes the user
exports.removeUser = function(id, callback) {
    colUser.remove({_id: id}, {single: true}, function(err, obj) {
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
exports.addAuthKey = function(userId, authkey, expiry, callback) {
    var regAuth = {
        userId: userId,
        authkey: authkey,
        expiry: expiry
    };
    colRegAuth.insert(regAuth, function(result) {
        callback(result);
    });
};

exports.checkAuthKey = function(key, callback) {
    colRegAuth.findOne({authkey: key}, function(err, result) {
        callback(result);
    });
};

exports.deleteAuthKey = function(key, callback) {
    colRegAuth.remove({authkey: key}, {single: true}, function(err, obj) {
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

//Add a friendship
exports.addFriendship = function(from, to, callback) {
    colFriend.insert({from: from, to: to, accepted: false}, function(result) {
        callback(result);
    });
};

//Remove friendship
exports.deleteFriendship = function() {

};