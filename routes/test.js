var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');
var mp = require('multiparty');
var utils = require('../utils/utils');
var DB = require("../utils/db");

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
router.post('/calendar/:uid', function (req, res, next) {
	DB.Calendar.add(req, res, function (result) {
		res.json(result);
	});
});
router.get('/calendar/:uid', function (req, res, next) {
	DB.Calendar.find(req, res, function (result) {
		res.json(result);
	});
});
router.delete('/calendar/:uid', function (req, res, next) {
	DB.Calendar.remove(req, res, function (result) {
		res.json(result);
	});
});
router.delete('/calendar/acl/:uid/:rid', function (req, res, next) {
	DB.Calendar.removeACL(req, res, function (result) {
		res.json(result);
	});
});
module.exports = router;