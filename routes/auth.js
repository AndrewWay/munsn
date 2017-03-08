var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var utils = require('../utils/utils');
var ems = require('../utils/ems');

router.get('/', function(req, res, next) {
    if (req.query.key == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.query.key == null) {
        res.json({error: "null"});
    }
    else {
        //Check if auth key exists
        db.checkAuthKey(req.query.key, function(checkResult) {
            console.log(JSON.stringify(checkResult));
            if (checkResult != null) {
                console.log("ROUTER: /auth: Found authkey for key: " + checkResult.authkey);
                var currentDate = new Date();
                var id = checkResult.userId;
                //Check to see if key expired
                //If not then auth the user, and delete the key from regauths
                if (currentDate.getTime() <= checkResult.expiry) {
                    console.log("[ROUTER] /auth: authkey is valid");
                    db.deleteAuthKey(checkResult.authkey, function(deleteResult) {
                        db.updateUser(id, {auth: true}, function(updateResult) {
                            console.log("ROUTER: /auth: User updated");
                        });
                    });
                }
                //If key expired, then send a new key with a new email
                else {
                    console.log("[ROUTER] /auth: authkey is expired");
                    console.log("[ROUTER] /auth: sending new email to user " + checkResult.userId);
                    //Delete previous authkey
                    db.deleteAuthKey(checkResult.authkey, function(deleteResult) {
                        var date = new Date();
                        var authkey = id + date.getTime();
                        var mins = 1;
                        console.log("[ROUTER] /auth: deleted authkey " + checkResult.authkey);
                        //Generate new authkey
                        db.addAuthKey(id, authkey, utils.addMinsToDate(date, mins).getTime(), function(result) {
                            console.log(result);
                        });
                        //Get user's email address
                        db.findUserById(id, function(userResult) {
                            var email = {
                                subject: "MUNSON - New Confirmation Email",
                                to: userResult.email,
                                text: "Looks like your old confirmation email expired. Here's a new one: http://localhost:3000/auth?key=" + authkey
                            };
                            //Send a new confirmation email
                            ems.sendEmail(email, function(emailResult) {
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