var express = require('express');
var router = express.Router();
var DB = require('../utils/db');
var utils = require('../utils/utils');
var EMS = require('../utils/ems');

router.get('/', function(req, res, next) {
    if (req.query.key == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.query.key == null) {
        res.json({error: "null"});
    }
    else {
        //Check if auth key exists
        DB.auth_findAuthKey(req.query.key, function(checkResult) {
            console.log(JSON.stringify(checkResult));
            if (checkResult != null) {
                console.log("ROUTER: /auth: Found authkey for key: " + checkResult.authkey);
                var currentDate = new Date();
                var id = checkResult.userId;
                //Check to see if key expired
                //If not then auth the user, and delete the key from regauths
                if (currentDate.getTime() <= checkResult.expiry) {
                    console.log("[ROUTER] /auth: authkey is valid");
                    DB.auth_deleteAuthKey(checkResult.authkey, function(deleteResult) {
                        DB.users_updateUser(id, {auth: true}, function(updateResult) {
                            console.log("ROUTER: /auth: User updated");
                        });
                    });
                }
                //If key expired, then send a new key with a new email
                else {
                    console.log("[ROUTER] /auth: authkey is expired");
                    console.log("[ROUTER] /auth: sending new email to user " + checkResult.userId);
                    //Delete previous authkey
                    DB.auth_deleteAuthKey(checkResult.authkey, function(deleteResult) {
                        var date = new Date();
                        var authkey = id + date.getTime();
                        var mins = 1;
                        console.log("[ROUTER] /auth: deleted authkey " + checkResult.authkey);
                        //Generate new authkey
                        DB.auth_addAuthKey(id, authkey, utils.addMinsToDate(date, mins).getTime(), function(result) {
                            console.log(result);
                        });
                        //Get user's email address
                        DB.users_findUserById(id, function(userResult) {
                            //Send a new confirmation email
                            EMS.sendAdditionalConfirmationEmail(userResult, function(emailResult) {
                                console.log(emailResult);
                            });
                        });
                    });
                }
            }
        });
        res.redirect('/');
    }
});

module.exports = router;