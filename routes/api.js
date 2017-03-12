var express = require('express');
var router = express.Router();
var DB = require('../utils/db');
var EMS = require('../utils/ems');
var utils = require('../utils/utils');

//GET VERBS
var getUserInfo = '/user/info/:uid';
var getFriends = '/user/friends/:uid';
var getFriendSentReq = '/user/friends/sent/:uid';
var getFriendReceivedReq = '/user/friends/received/:uid';
var getGroupsByUID = '/user/groups/:uid';
var getGroupUsers = '/group/users/:gid';
var getGroupInfo = '/group/info/:gid';
//POST VERBS
var updateUser = '/user/update/:uid';
var deleteUser = '/user/remove/:uid';
var registerUser = '/user/register';
var addFriendReq = '/user/add/request';
var delFriendReq = '/user/remove/request';
var delFriend = '/user/remove/friend';
var createGroup = '/group/create';
var delGroup = '/group/remove/:gid';
var updateGroup = '/group/update';
var addGroupUser = '/group/add/user';
var delGroupUser = '/group/remove/user';
//GET the user by userId
/**
 * Returns the JSON object representing a user from the database
 */
router.get(getUserInfo, function(req, res, next) {
    if (req.params.uid == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.params.uid == null) {
        res.json({error: "null"});
    }
    else {
        DB.users_findUserById(req.params.uid, function(user) {
            res.json(user);
        });
    }
});

//POST update the user
/**
 * ???
 */
router.post(updateUser, function(req, res, next) {
    if (req.params.uid == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.params.uid == null) {
        res.json({error: "null"});
    }
    else {
        var pass = {pass: req.body.pass};
        DB.users_updateUser(req.params.uid, pass, function(result) {
            console.log(result);
        });
    }
});

//POST remove the user

router.post(deleteUser, function(req, res, next) {
    if (req.params.uid == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.params.uid == null) {
        res.json({error: "null"});
    }
    else {
        DB.users_removeUser(req.params.uid, function(result) {
            console.log(result);
        });
    }
});

//POST register the user
/**
 * Register the user by HTMLForm.
 */
router.post(registerUser, function(req, res, next) {
    if(!Object.keys(req.body).length){
        console.log("[ROUTER] /api/user/register: Empty Body");
    }
    //Create user
    try{
        var user = {
            user: req.body.user,
            pass: req.body.pass,
            email: req.body.email,
            auth: false,
            _id: utils.getIdFromEmail(req.body.email)
        //_id: req.body.uid
        };
    } catch(err){
       console.log("[ROUTER] /api/user/register: Body Field Error");
    }
    //Insert user with false auth into colUsers
    DB.users_addUser(user, function(result) {
        console.log(result);
    });
    //Create auth key and store it in colAuths
    var date = new Date();
    var authkey = user._id + date.getTime();
    var mins = 1;
    DB.auth_addAuthKey(user, authkey, utils.addMinsToDate(date, mins).getTime(), function(result) {
        console.log("[API] /register: Added authkey with result\n" + result);
    });

    res.redirect('/');
});

//GET list of friends from userId
router.get(getFriends, function(req, res, next) {
    if (req.params.uid) {
        DB.friends_findAllFriendsForUser(req.params.uid, function(result) {
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
router.post(addFriendReq, function(req, res, next) {
    //Declare body variables
    var userId = req.body.uid;
    var friendId = req.body.fid;
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
router.get(getFriendSentReq, function(req, res, next) {
    //Declare query variables
    var userId = req.params.uid;
    if (userId) {
        DB.friendRequest_findRequestsByUser({userId: userId}, function(result) {
            res.json(result);
        });
    }
});

//GET get recieved friend requests for a specified user
router.get(getFriendReceivedReq, function(req, res, next) {
    //Declare query variables
    var userId = req.params.uid;
    if (userId) {
        DB.friendRequest_findRequestsByUser({friendId: userId}, function(result) {
            res.json(result);
        });
    }
});

//Removes friend request
router.post(delFriendReq, function(req, res, next) {
    //Declare body variables
    var userId = req.body.uid;
    var friendId = req.body.fid;
    if (userId && friendId) {
        DB.friendRequest_deleteRequest(userId, friendId, function(result) {
            res.json(result);
        });
    }
});

//POST remove friendId from userId
//Return json response
//Result: xy, where x is 0 for no error, 1 for error, y is 0 for successful deletion, 1 for unsuccessful deletion
router.post(delFriend, function(req, res, next) {
    //Declare body variables
    var userId = req.body.uid;
    var friendId = req.body.fid;
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
router.post(createGroup, function(req, res, next) {
    var creatorId = req.body.gid;
    var groupName = req.body.name;
    if (creatorId && groupName) {
        DB.group_addGroup(creatorId, groupName, function(result) {
            DB.groupMembers_addMember(result.ops[0]._id, creatorId, function(memberResult) {
                res.json(memberResult);
            });
        });
    }
});

//Remove a group
router.post(delGroup, function(req, res, next) {
    var groupId = req.params.gid;
    if (groupId) {
        DB.group_removeGroup(groupId, function(result) {
            res.json(result);
        });
    }
});

//find groups by userid
router.get(getGroupsByUID, function(req, res, next) {
    var userId = req.params.uid;
    if (userId) {
        DB.group_findGroupsByUser(userId, function(result) {
            res.json(result);
        });
    }
});

//Update a group
router.post(updateGroup, function(req, res, next) {
    var groupId = req.body.gid;
    var updates = req.body.updates;
    if (groupId && updates) {
        DB.group_updateGroup(groupId, updates, function(result) {
            res.json(result);
        });
    }
});

//Add member to group
router.post(addGroupUser, function(req, res, next) {
    var groupId = req.body.gid;
    var userId = req.body.uid;
    if (groupId && userId) {
        DB.groupMembers_addMember(groupId, userId, function(result) {
            res.json(result);
        });
    }
});

//Remove member from group
router.post(delGroupUser, function(req, res, next) {
    var groupId = req.body.gid;
    var userId = req.body.uid;
    if (groupId && userId) {
        DB.groupMembers_removeMember(groupId, userId, function(result) {
            res.json(result);
        });
    }
});

//Find members for group
router.get(getGroupUsers, function(req, res, next) {
    var groupId = req.params.gid;
    if (groupId) {
        DB.groupMembers_findAllMembers(groupId, function(result) {
            res.json(result);
        });
    }
});

module.exports = router;