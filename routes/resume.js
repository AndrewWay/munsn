var express = require('express');
var router = express.Router();
var DB = require('../utils/db');

//TODO:

router.get('/', function (req, res, next) {
	if (req.session.user) {
		res.render('resume', {});
	} else {
		res.render('resume', {});
	}
});

module.exports = router;