var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require('../utils/utils');
var console = require('../utils/consoleLogger');
var DB = require('../utils/db');
var UserID = require('../middleware/functions').UserID;
/**
 * Return User profile picture named 'profile'
 * GET -> '/content/image/profile/:uid'
 */
router.get('/image/profile/:uid', UserID, function (req, res, next) {
	var file = utils.findFiles('profile', path.join(__dirname, '../content/images/user/' + req.params.uid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});
/**
 * Return Group profile picture named 'group'
 * GET -> '/content/image/group/:gid'
 */
router.get('/image/group/:gid', UserID, function (req, res, next) {
	var file = utils.findFiles('group', path.join(__dirname, '../content/images/group/' + req.params.gid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});
/**
 * Return User resume named 'resume.pdf'
 * GET -> src='/content/resume/user/:uid'
 */
router.get('/resume/user/:uid', UserID, function (req, res, next) {
	var file = utils.findFiles('resume', path.join(__dirname, '../content/resumes/user/' + req.params.uid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});
/**
 * Return a Post Image or other file based on the postid, saves the file as the id for the name
 * GET -> '/content/posts/:pid/:id'
 */
router.get('/posts/:pid/:id', UserID, function (req, res, next) {
	var file = utils.findFiles(req.params.id, path.join(__dirname, '../content/posts/' + req.params.pid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});

/**
 * Upload a User profile image based on the userid
 * POST -> '/content/image/profile/:uid'
 */
router.post('/image/profile/:uid', UserID, function (req, res, next) {
	utils.uploadImage(req, 'user/' + req.params.uid, 'profile', function (result) {
		res.json(result);
	});
});

/**
 * Upload a Group profile image based on the groupid
 * POST -> '/content/image/group/:gid'
 */
router.post('/image/group/:gid', UserID, function (req, res, next) {
	utils.uploadImage(req, 'group/' + req.params.gid, 'group', function (result) {
		res.json(result);
	});
});
/**
 * Upload a User Resume based on the userid
 * POST -> '/content/resume/user/:uid'
 */
router.post('/resume/user/:uid', UserID, function (req, res, next) {
	utils.upload(req, 'resumes/user/' + req.params.uid, 'resume', function (result) {
		res.json(result);
	});
});
/**
 * Upload a Post Image or other file based on the postid, saves the file as the id for the name
 * NOTE: ONLY SUPPORTS ONE FILE PER POST RIGHT NOW
 * POST -> '/content/posts/:pid/:id'
 */
router.post('/posts/:pid/:id', UserID, function (req, res, next) {
	utils.upload(req, 'posts/' + req.params.pid + '/', req.params.id, function (result) {
		res.json(result);
	});
});
/* Unused
router.post('/image/post/:pid', function(req, res, next) {
	uploadImage(req, 'posts/'+req.params.pid);
	res.redirect('back');
});
*/
/**
 *
 */
router.delete('/resume/user/:uid', UserID, function (req, res, next) {
	utils.remove('resume', path.join(__dirname, '../content/resumes/user/' + req.params.uid), function (result) {
		res.json(result);
	});
});
router.delete('/image/profile/:uid', UserID, function (req, res, next) {
	utils.remove('profile', path.join(__dirname, '../content/images/user/' + req.params.uid), function (result) {
		res.json(result);
	});
});
router.delete('/image/group/:gid', UserID, function (req, res, next) {
	utils.remove('group', path.join(__dirname, '../content/images/user/' + req.params.gid), function (result) {
		res.json(result);
	});
});
router.get('/calendar/user/:uid', UserID, function (req, res, next) {
	DB.Calendar.get(req, res, function (result) {
		res.json(result);
	});
});
router.post('/calendar/user/:uid', UserID, function (req, res, next) {
	DB.Calendar.add(req, res, function (result) {
		res.json(result);
	});
});
router.delete('/calendar/user/:uid', UserID, function (req, res, next) {
	DB.Calendar.remove(req, res, function (result) {
		res.json(result);
	});
});
router.get('/calendar/events/:uid', UserID, function (req, res, next) {
	DB.Calendar.getEvents(req, res, function (result) {
		res.json(result);
	});
});
router.post('/calendar/events/:uid', UserID, function (req, res, next) {
	DB.Calendar.insertEvent(req, res, function (result) {
		res.json(result);
	});
});

router.delete('/calendar/events/:uid', UserID, function (req, res, next) {
	DB.Calendar.removeEvent(req, res, function (result) {
		res.json(result);
	});
});
module.exports = router;