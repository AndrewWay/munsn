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
var date = new Date();
var timeZone = date.getTimezoneOffset();
alert(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds() + (timeZone > 0 ? "-" : "+") + Math.floor(Math.abs(timeZone) / 60) + ":" + Math.abs(timeZone) % 60);
module.exports = router;