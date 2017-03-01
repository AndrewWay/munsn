var express = require('express');
var router = express.Router();
var db = require('../utils/db');

/*
    GET one user based on id
*/
router.get('/users', function(req, res, next) {
    if (req.query.id !== undefined) {
        res.json(db.findUser(id));
    }
    else {
        res.json({error: "failed"});
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
    db.findUser(user, function(userRes) {
        res.render('index', {title: userRes.user});
    });
});


module.exports = router;