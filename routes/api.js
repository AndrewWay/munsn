var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var ems = require('../utils/ems');
var utils = require('../utils/utils');

/*
    GET one user based on id
*/
router.get('/users', function(req, res, next) {
    if (req.query.id == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.query.id == null) {
        res.json({error: "null"});
    }
    else {
        db.findUserById(req.query.id, function(user) {
            res.json(user);
        });
    }
});

router.post('/users/update', function(req, res, next) {
    if (req.body.id == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.body.id == null) {
        res.json({error: "null"});
    }
    else {
        var pass = {pass: req.body.pass};
        db.updateUser(req.body.id, pass, function(result) {
            console.log(result);
        });
    }
});

router.post('/users/remove', function(req, res, next) {
    if (req.body.id == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.body.id == null) {
        res.json({error: "null"});
    }
    else {
        db.removeUser(req.body.id, function(result) {
            console.log(result);
        });
    }
});

router.post('/register', function(req, res, next) {
    //Create user
    var user = {
        user: req.body.user,
        pass: req.body.pass,
        email: req.body.email,
        auth: false,
        _id: utils.getIdFromEmail(req.body.email)
    };
    //Insert user with false auth into colUsers
    db.insertUser(user, function(result) {
        console.log(result);
    });
    //Create auth key and store it in colAuths
    var date = new Date();
    var authkey = user._id + date.getTime();
    var mins = 1;
    db.addAuthKey(user._id, authkey, utils.addMinsToDate(date, mins).getTime(), function(result) {
        console.log("[API] /register: Added authkey with result\n" + result);
    });
    //Send auth email to the user with the auth link
    var email = {
        to: req.body.email,
        text: "Welcome to MUNSON! In order to continue using the site as a registered user, please confirm your registration by clicking the link: http://localhost:3000/auth?key=" + authkey + ". We are glad you can join us! Once registered you can fully access the website!"
    };
    ems.sendEmail(email, function(result) {
        console.log(result);
    });
});

router.post('/login', function(req, res, next) {
    var userReq = {
        user: req.query.user,
        pass: req.query.pass
    };
    db.findUser(userReq, function(userRes) {
        res.render('index', {title: userRes.user});
    });
});

module.exports = router;