var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
    if (req.body.user == "test") {
        if (req.body.pass == "123") {
            res.render('index', {title: 'test'});
        }
    }
});

module.exports = router;
