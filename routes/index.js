var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.cookies.user == undefined) {
        res.render('index', {title: "undefined"});
    }
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
    if (req.body.user == "test") {
        console.log("username successful");
        if (req.body.pass == "test123") {
            console.log("pass successful");
            res.render('index', {title: "req.body.user"});
        }
    }
});

module.exports = router;
