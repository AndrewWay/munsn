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
    EMS.sendConfirmationEmail(user, authkey, function(result) {
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

/*
//POST add friendId to userId
router.post('/post/addFriend', function(req, res, next) {
    if (req.body.userId && req.body.friendId) {
        DB.friends_addFriendToUser(req.body.userId, req.body.friendId, function(result) {
            console.log(result);
            res.json(JSON.stringify(result));
        });
    }
});
*/

//POST send a friend request
// xyz
// x is 
router.post('/post/sendFriendRequest', function(req, res, next) {
    //Declare body variables
    var userId = req.body.userId;
    var friendId = req.body.friendId;
    //Check if body variables are not null, or undefined
    if (userId && friendId) {
        //Check to see if both users exist
        DB.users_findUsers({_id: {$in: [userId, friendId]}}, function(findResult) {
            //If they both exist, add request
            if (findResult.length == 2) {
                DB.friendRequest_addRequest(userId, friendId, function(requestResult) {
                    //Operation successfully completed
                    if (requestResult != null) {
                        res.json({result: "000", operation: "sendFriendRequest", text: "Sent friend request"});
                    }
                    //Error with collection friendRequest
                    else{
                        res.json({result: "001", operation: "sendFriendRequest", text: "Error with collection friendRequest"});
                    }
                });
            }
            //Else return result json
            else {
                console.log("\x1b[32m%s\x1b[0m%s", "[API]",  " /post/sendFriendRequest: userId: " + userId + ", friendId: " + friendId + ", dbResult: " + JSON.stringify(findResult));
                res.json({result: "010", operation: "sendFriendRequest", text: "One or more users could not be found"});
            }
        });
    }
});

//GET get friend requests for a specified user
router.get('/get/getFriendRequestsSentByUser', function(req, res, next) {
    //Declare query variables
    var userId = req.query.userId;
    if (userId) {
        DB.friendRequest_findRequestsByUser({userId: userId}, function(result) {
            res.json(result);
        });
    }
});

//GET get recieved friend requests for a specified user
router.get('/get/getFriendRequestsRecievedByUser', function(req, res, next) {
    //Declare query variables
    var userId = req.query.userId;
    if (userId) {
        DB.friendRequest_findRequestsByUser({friendId: userId}, function(result) {
            res.json(result);
        });
    }
});

//Removes friend request
router.post('/post/removeFriendRequest', function(req, res, next) {
    //Declare body variables
    var userId = req.body.userId;
    var friendId = req.body.friendId;
    if (userId && friendId) {
        DB.friendRequest_deleteRequest(userId, friendId, function(result) {
            res.json(result);
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

//Create a group
router.post('/post/createGroup', function(req, res, next) {
    var creatorId = req.body.creatorId;
    var groupName = req.body.groupName;
    if (creatorId && groupName) {
        DB.group_addGroup(creatorId, groupName, function(result) {
            res.json(result);
        });
    }
});

//Remove a group
router.post('/post/removeGroup', function(req, res, next) {
    var groupId = req.body.groupId;
    if (groupId) {
        DB.group_removeGroup(groupId, function(result) {
            res.json(result);
        });
    }
});

//Remove a group
router.post('/post/findGroupsByUser', function(req, res, next) {
    var userId = req.body.userId;
    if (userId) {
        DB.group_findGroupsByUser(userId, function(result) {
            res.json(result);
        });
    }
});

//Update a group
router.post('/post/updateGroup', function(req, res, next) {
    var groupId = req.body.groupId;
    var updates = req.body.updates;
    if (groupId && updates) {
        DB.group_updateGroup(groupId, updates, function(result) {
            res.json(result);
        });
    }
});

//Add member to group 
router.post('/post/addGroupMember', function(req, res, next) {
    var groupId = req.body.groupId;
    var userId = req.body.userId;
    if (groupId && userId) {
        DB.groupMembers_addMember(groupId, userId, function(result) {
            res.json(result);
        });
    }
});

//Remove member from group 
router.post('/post/removeGroupMember', function(req, res, next) {
    var groupId = req.body.groupId;
    var userId = req.body.userId;
    if (groupId && userId) {
        DB.groupMembers_removeMember(groupId, userId, function(result) {
            res.json(result);
        });
    }
});

//Find members for group
router.get('/get/getGroupMembers', function(req, res, next) {
    var groupId = req.body.groupId;
    if (groupId) {
        DB.groupMembers_findAllMembers(groupId, function(result) {
            res.json(result);
        });
    }
});

module.exports = router;