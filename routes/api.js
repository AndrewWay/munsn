var express = require('express');
var router = express.Router();
var db = require('../utils/db');

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
    var user = {
        user: req.body.user,
        pass: req.body.pass,
        email: req.body.email
    };
    db.insertUser(user, function(result) {
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