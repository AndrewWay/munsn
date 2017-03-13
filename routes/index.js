var express = require('express');
var router = express.Router();
var DB = require('../utils/db');

/**
 *  GET home page.
 */
router.get('/', function (req, res, next) {
	res.render('login', {
		title: 'Login'
	});
});
/**
 * GET registration page.
 */
router.get('/register', function (req, res, next) {
	res.render('register', {
		title: 'Register'
	});
});
/**
 * Post to login form.
 */
router.post('/login', function (req, res, next) {
	var userReq = {
		user: req.body.user,
		pass: req.body.pass
	};
	DB.findUserById(userReq.user, function (userRes) {
		res.render('index', {
			title: userRes.user
		});
	});
});

module.exports = router;