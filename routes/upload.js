var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');

/* GET Test upload page. */
router.get('/', function(req, res, next) {
	res.render('upload', {
		title : 'Uploader'
	});
});
module.exports = router;
