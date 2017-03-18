module.exports = function (DBGroupMembers, collectionGroupMembers) {
	//Add member to group
	DBGroupMembers.add = function (req, res, callback) {
		var groupId = req.body.gid;
		var memberId = req.body.uid;
		console.log("[DBGroupMembers] Add: '" + memberId + "'-> '" + groupId + "'");
		if (groupId && memberId) {
			collectionGroupMembers.update({
				_id: groupId
			}, {
				$push: {
					members: memberId
				}
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBGroupMembers] Add: " + err.message);
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
		} else {
			console.warn("[DBGroupMembers] Add: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Finds all members of a group and returns it as an array
	DBGroupMembers.find = function (req, res, callback) {
		var groupId = req.params.gid;
		console.log("[DBGroupMembers] Find: '" + req.params.gid + "'");
		if (groupId) {
			collectionGroupMembers.find({
				_id: groupId
			}, {
				members: true
			}).toArray(function (err, result) {
				if (err) {
					console.error("[DBGroupMembers] Find: " + err.message);
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
		} else {
			console.warn("[DBGroupMembers] Find: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Removes member from group
	DBGroupMembers.remove = function (req, res, callback) {
		var groupId = req.body.gid;
		var memberId = req.body.uid;
		console.log("[DBGroupMembers] Remove: '" + memberId + "'->'" + groupId + "'");
		if (groupId && memberId) {
			collectionGroupMembers.update({
				_id: groupId
			}, {
				$pull: {
					members: memberId
				}
			}, function (err, result) {
				if (err) {
					console.error("[DBGroupMembers] Remove: " + err.message);
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
		} else {
			console.warn("[DBGroupMembers] Remove: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};