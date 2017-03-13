var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');

/* GET Test upload page. */
router.get('/upload', function (req, res, next) {
	res.render('upload', {
		title: 'Uploader'
	});
});
/* GET jqueryTest page. */
router.get('/jqueryTest', function (req, res, next) {
	res.render('jqueryTest');
});
module.exports = router;