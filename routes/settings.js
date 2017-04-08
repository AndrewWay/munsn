var express = require('express');
var router = express.Router();
var DB = require('../utils/db');

//TODO:
//This currently shows the profile regardless if logged in
//Need to add templating in so that functionality changes based if the user is logged in or not
router.get('/', function (req, res, next) {
	if (req.session.user) {
		res.render('settings', {
			session: JSON.stringify(req.session)
		});
	} else {
		//res.render('settings', {});
		res.redirect('/');
	}
});

module.exports = router;