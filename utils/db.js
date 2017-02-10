var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var dbURL = 'mongodb://localhost:27017/db';
exports.dbURL = dbURL;

//Collections
var colUser;

var db = mongoClient.connect(dbURL, function(err, db) {
	assert.equal(null, err);
	console.log("Connected to mongo server: " + dbURL);
    colUser = db.collection("users");
});

//Insert one user into the user collection
exports.insertUser = function(user) {
    colUser.insert(user);
};

//Find the first user from the user collection
exports.findUser = function(user, callback) {
    colUser.find(user).limit(1).toArray(function(err, users) {
        assert.equal(1, users.length);
        callback(users[0]);
    });
};