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
    //Restricts and denies documents so they have a user, email from mun.ca, and pass
    db.createCollection("users", 
        {validator: 
            {$and: [{user: {$type: "string"}},
                    {pass: {$type: "string"}},
                    {email: {$regex: /@mun\.ca$/}}]},
        validationLevel: "strict",
        validationAction: "error"});

    colUser = db.collection("users");
    colRegAuth = db.collection("regauths");
    colFriend = db.collection("friends");
});

//Insert one user into the user collection
exports.insertUser = function(user, callback) {
    colUser.insert(user, function(result) {
        callback(result.toJSON());
    });
};

//Find a user by unique object id
exports.findUserById = function(id, callback) {
    colUser.find({_id: id}).limit(1).toArray(function(err, users) {
        assert.equal(1, users.length);
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
