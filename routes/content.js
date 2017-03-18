var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require('../utils/utils');

/**
 * Return User profile picture named 'profile'
 * HTMLImage Example: src='/content/image/user/user123'
 */
router.get('/image/profile/:uid', function (req, res, next) {
	var file = utils.findFiles('profile', path.join(__dirname, '../content/images/user/' + req.params.uid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});
/**
 * Return Group profile picture named 'group'
 * HTMLImage Example: src='/content/image/group/group123'
 */
router.get('/image/group/:gid', function (req, res, next) {
	var file = utils.findFiles('group', path.join(__dirname, '../content/images/group/' + req.params.gid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});
/**
 * Return User resume named 'resume.pdf'
 * Resume Example: src='/content/resume/user/user123'
 */
router.get('/resume/user/:uid', function (req, res, next) {
	var file = utils.findFiles('resume', path.join(__dirname, '../content/resumes/user/' + req.params.uid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});
/**
 * Return a Post Image or other file based on the postid, saves the file as the id for the name
 * Example: src='/content/posts/post123/any123'
 */
router.get('/posts/:pid/:id', function (req, res, next) {
	var file = utils.findFiles(req.params.id, path.join(__dirname, '../content/posts/' + req.params.pid)).next().value;
	utils.download(req, res, file, function (result) {
		res.json(result);
	});
});

/**
 * Upload a User profile image based on the userid
 * HTMLForm Example: action='/content/image/user/user123'
 */
router.post('/image/profile/:uid', function (req, res, next) {
	utils.uploadImage(req, 'user/' + req.params.uid, 'profile', function (result) {
		res.json(result);
	});
});

/**
 * Upload a Group profile image based on the groupid
 * HTMLForm Example: action='/content/image/group/test123'
 */
router.post('/image/group/:gid', function (req, res, next) {
	utils.uploadImage(req, 'group/' + req.params.gid, 'group', function (result) {
		res.json(result);
	});
});
/**
 * Upload a User Resume based on the userid
 * Resume Example: src='/content/resume/user/user123'
 */
router.post('/resume/user/:uid', function (req, res, next) {
	utils.upload(req, 'resumes/user/' + req.params.uid, 'resume', function (result) {
		res.json(result);
	});
});
/**
 * Upload a Post Image or other file based on the postid, saves the file as the id for the name
 * NOTE: ONLY SUPPORTS ONE FILE PER POST RIGHT NOW
 * Example: action='/content/posts/post123/any123'
 */
router.post('/posts/:pid/:id', function (req, res, next) {
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
router.delete('/resume/user/:uid', function (req, res, next) {
	utils.remove('resume', path.join(__dirname, '../content/resumes/user/' + req.params.uid), function (result) {
		res.json(result);
	});
});
router.delete('/image/profile/:uid', function (req, res, next) {
	utils.remove('profile', path.join(__dirname, '../content/images/user/' + req.params.uid), function (result) {
		res.json(result);
	});
});
router.delete('/image/group/:gid', function (req, res, next) {
	utils.remove('group', path.join(__dirname, '../content/images/user/' + req.params.gid), function (result) {
		res.json(result);
	});
});
module.exports = router;