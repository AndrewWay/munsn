var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');
var mp = require('multiparty');
var utils = require('../utils/utils');


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
//NOTE: This is a test route
//For testing multiparty with multipart/form-data
router.post('/', function (req, res, next) {
	var form = new mp.Form();
	//utils.upload(req, "upload/", 'name');
	form.parse(req, function (err, fields, files) {
		console.log(JSON.stringify(files));
		console.log(fields);
		if (err) {
			console.error('MegaDeath');
		} else {
			res.json(fields);
		}
	});
});

//TODO: Finish calendar features and move them to the content router

module.exports = router;