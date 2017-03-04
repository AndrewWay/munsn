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
    var email = {
        subject: "MUNSON - Confirmation Email",
        to: req.body.email,
        text: "Welcome to MUNSON! In order to continue using the site as a registered user, please confirm your registration by clicking the link: http://localhost:3000/auth?key=" + authkey + ". We are glad you can join us! Once registered you can fully access the website!"
    };
    EMS.sendEmail(email, function(result) {
        console.log(result);
    });
    res.redirect('/');
});

module.exports = router;