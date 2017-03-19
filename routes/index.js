var express = require('express');
var router = express.Router();
var DB = require('../utils/db');

/**
 *  GET home page.
 */
router.get('/', function (req, res, next) {
	if (req.session.user) {
		res.render('portal', {});
	}
	else {
		res.render('login', {
			title: 'Login'
		});
	}
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
 * logout
 */
router.get('/logout', function (req, res, next) {
    if (req.session.user) {
        req.session.destroy();
        res.render('login', {
            title: 'login'
        });
    }
});

router.get('/chat', function (req, res, next) {
	res.render('chat', {
		title: 'Register'
	});
});

module.exports = router;