var express = require('express');
var router = express.Router();
var DB = require('../utils/db');
var EMS = require('../utils/ems');
var utils = require('../utils/utils');

//GET the user by userId
router.get('/get/user', function(req, res, next) {
    if (req.query.id == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.query.id == null) {
        res.json({error: "null"});
    }
    else {
        DB.users_findUserById(req.query.id, function(user) {
            res.json(user);
        });
    }
});

//POST update the user
router.post('/post/updateUser', function(req, res, next) {
    if (req.body.id == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.body.id == null) {
        res.json({error: "null"});
    }
    else {
        var pass = {pass: req.body.pass};
        DB.users_updateUser(req.body.id, pass, function(result) {
            console.log(result);
        });
    }
});

//POST remove the user
router.post('/post/removeUser', function(req, res, next) {
    if (req.body.id == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.body.id == null) {
        res.json({error: "null"});
    }
    else {
        DB.users_removeUser(req.body.id, function(result) {
            console.log(result);
        });
    }
});

//POST register the user
router.post('/post/register', function(req, res, next) {
    //Create user
    var user = {
        user: req.body.user,
        pass: req.body.pass,
        email: req.body.email,
        auth: false,
        _id: utils.getIdFromEmail(req.body.email)
    };
    //Insert user with false auth into colUsers
    DB.users_addUser(user, function(result) {
        console.log(result);
    });
    //Create auth key and store it in colAuths
    var date = new Date();
    var authkey = user._id + date.getTime();
    var mins = 1;
    DB.auth_addAuthKey(user._id, authkey, utils.addMinsToDate(date, mins).getTime(), function(result) {
        console.log("[API] /register: Added authkey with result\n" + result);
    });
    //Send auth email to the user with the auth link
    EMS.sendConfirmationEmail(user, function(result) {
        console.log(result);
    });
    res.redirect('/');
});

//GET list of friends from userId
router.get('/get/friends', function(req, res, next) {
    if (req.query.userId) {
        DB.friends_findAllFriendsForUser(req.query.userId, function(result) {
            res.json(result[0]);
        });
    }
});

//POST add friendId to userId
router.post('/post/addFriend', function(req, res, next) {
    if (req.body.userId && req.body.friendId) {
        DB.friends_addFriendToUser(req.body.userId, req.body.friendId, function(result) {
            console.log(result);
            res.json(JSON.stringify(result));
        });
    }
});

//POST remove friendId from userId
//Return json response
//Result: xy, where x is 0 for no error, 1 for error, y is 0 for successful deletion, 1 for unsuccessful deletion
router.post('/post/removeFriend', function(req, res, next) {
    //Declare body variables
    var userId = req.body.userId;
    var friendId = req.body.friendId;
    //Check if body variables are not null, or undefined
    if (userId && friendId) {
        DB.friends_deleteFriendFromUser(userId, friendId, function(result) {
            var dbResult = result.result;
            //Check for database error
            if (dbResult == null) {
                console.log("\x1b[31m%s\x1b[0m%s", "[API]",  " /post/removeFriend: userId: " + userId + ", friendId: " + friendId + ", dbResult: " + JSON.stringify(dbResult));
                res.json({result: "10", operation: "deleteFriend", text: "Database error"});
            }   
            else {
                console.log("\x1b[32m%s\x1b[0m%s", "[API]",  " /post/removeFriend: userId: " + userId + ", friendId: " + friendId + ", dbResult: " + JSON.stringify(dbResult));
                if (dbResult.ok == 1 && dbResult.nModified == 1) {
                    res.json({result: "00", operation: "deleteFriend", text: "Removed friend from user"});
                }
                else if (dbResult.ok == 1 && dbResult.nModified == 0) {
                    res.json({result: "01", operation: "deleteFriend", text: "Could not remove friend from user"});
                }   
            }  
        });
    }
});

module.exports = router;