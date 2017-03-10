var express = require('express');
var router = express.Router();
var path = require('path');
var utils = require('../utils/utils');

/**
 * Return User profile picture named 'profile'
 * HTMLImage Example: src='/content/image/user/user123'
 */
router.get('/image/profile/:uid', function(req, res, next) {
	var file = utils.findFiles('profile',path.join(__dirname, '../content/images/user/'+req.params.uid)).next().value;
	utils.download(req,res,file);
});
/**
 * Return Group profile picture named 'group'
 * HTMLImage Example: src='/content/image/group/group123'
 */
router.get('/image/group/:gid', function(req, res, next) {
	var file = findFiles('group',path.join(__dirname, '../content/images/group/'+req.params.gid)).next().value;
	utils.download(req,res,file);
});

/**
 * Upload a User profile image based on the userid
 * HTMLForm Example: action='/content/image/user/user123'
 */
router.post('/image/profile/:uid', function(req, res, next) {
	utils.uploadImage(req, 'user/'+req.params.uid, 'profile');
    res.redirect('back');           
});

/**
 * Upload a Group profile image based on the groupid
 * HTMLForm Example: action='/content/image/group/test123' 
 */
router.post('/image/group/:gid', function(req, res, next) {
	utils.uploadImage(req, 'group/'+req.params.gid, 'group');
    res.redirect('back');   
});

/* Unused 
router.post('/image/post/:pid', function(req, res, next) {
	uploadImage(req, 'posts/'+req.params.pid);
    res.redirect('back');   
});
*/

module.exports = router;
