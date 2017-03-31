var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBPosts, collectionPosts) {
	//Add a post
	DBPosts.add = function (req, res, callback) {
		var date = new Date();
        
	};

	//Remove a post by id
	DBPosts.remove = function (req, res, callback) {
		console.log("[DBPosts] Remove", "'" + req.body.pid + "'");
		collectionPosts.remove({
			_id: new ObjectID(req.body.pid)
		}, function (err, result) {
			if (err) {
				console.error("[DBPosts] Remove", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok'
				});
			}
		});
	};

	//Get posts per user
	DBPosts.findByUserId = function (req, res, callback) {
		console.log("[DBPosts] FindByUID", "'" + req.UserID + "'");
		collectionPosts.find({
			authorid: req.UserID
		}).toArray(function (err, result) {
			if (err) {
				console.error("[DBPosts] FindByUID", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok',
					data: result
				});
			}
		});
	};

	//Get posts per post id
	DBPosts.findByPostId = function (req, res, callback) {
		console.log("[DBPosts] FindByPID", "'" + req.params.pid + "'");
		collectionPosts.find({
			_id: new ObjectID(req.params.pid)
		}).toArray(function (err, result) {
			if (err) {
				console.error("[DBPosts] FindByPID", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok',
					data: result
				});
			}
		});
	};

	//Update post
	DBPosts.update = function (req, res, callback) {
		var date = new Date();
		var updates = {
			data: req.body.data,
			modified: date,
			visibility: req.body.visibility
		};
		console.log("[DBPosts] Update", "'" + req.body.pid + "'->'" + JSON.stringify(updates) + "'");
		collectionPosts.update({
			_id: new ObjectID(req.body.pid)
		}, {
			$set: updates
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.error("[DBPosts] Update", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					status: 'ok'
				});
			}
		});
	};
};