var express = require('express');
var router = express.Router();
var db = require('../utils/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/login', function(req, res, next) {
    var userReq = {
        user: req.body.user,
        pass: req.body.pass
    };
    db.findUserById(userReq.user, function(userRes) {
        res.render('index', {title: userRes.user});
    });
});



module.exports = router;
