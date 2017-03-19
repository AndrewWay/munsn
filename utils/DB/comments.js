module.exports = function (DBComments, collectionComments) {
	//Add a comment
	DBComments.add = function (req, res, callback) {
		var date = new Date();
		var postId = req.body.pid;
		var comment = {
			commentid: req.body.authorid + date.getTime(),
			authorid: req.body.authorid,
			data: [{
				data: req.body.data,
				date: date.getTime()
			}]
		};
		console.log("[DBComments] Add: '" + postId + "'->'" + JSON.stringify(comment) + "'");
		collectionComments.update({
			_id: postId
		}, {
			$push: {
				comments: comment
			}
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.error("[DBComments] Add: " + err.message);
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

	//Remove a comment using commentId
	DBComments.removeById = function (req, res, callback) {
		var postId = req.body.pid;
		var commentId = req.body.cid;
		console.log("[DBComments] RemoveByID: '" + commentId + "'->'" + postId + "'");
		collectionComments.remove({
			_id: postId,
			comments: {
				commentId: commentId
			}
		}, function (err, result) {
			if (err) {
				console.error("[DBComments] RemoveByID:" + err.message);
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

	//Get comments per userid
	DBComments.findByPostId = function (req, res, callback) {
		var userId = req.body.uid;
		console.log("[DBComments] FindByPID: '" + userId + "'");
		collectionComments.find({
			authorid: userId
		}).toArray(function (err, result) {
			if (err) {
				console.error("[DBComments] FindByPID: " + err.message);
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

	//Update comment
	DBComments.update = function (req, res, callback) {
		var updates = {
			date: new Date(),
			data: req.params.data
		};
		var query = {
			_id: req.params.pid,
			"comments.commentid": req.params.commentid
		};
		console.log("[DBComments] Update: '" + JSON.stringify(updates) + "'->'" + JSON.stringify(query) + "'");
		collectionComments.update(query, {
			$push: {
				"comments.data": updates
			}
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.error("[DBComments] Update: " + err);
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