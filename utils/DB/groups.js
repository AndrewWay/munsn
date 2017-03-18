module.exports = function (DBGroups, collectionGroups, collectionGroupMembers) {
	//Add a group
	DBGroups.add = function (req, res, callback) {
		var creatorId = req.body.gid;
		var groupName = req.body.name;
		var row = {
			name: req.body.name,
			creatorid: req.body.uid,
			ownerid: req.body.uid,
			courses: undefined,
			created: new Date()
		};
		console.log("[DBGroups] Add: '" + row.ownerid + "'->'" + row.name + "'");
		if (row.name && row.ownerid) {
			var date = new Date();
			collectionGroups.insert(row, function (err, result) {
				if (err) {
					console.error("[DBGroups] Add: " + err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					collectionGroupMembers.update({
						_id: result.ops[0]._id
					}, {
						$push: {
							members: creatorId
						}
					}, {
						upsert: true
					}, function (err, result) {
						if (err) {
							console.error("[DBGroups] Add: " + err.message);
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
				}
			});
		} else {
			console.warn("[DBGroups] Add Group: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};


	//Find a group by user
	DBGroups.findByUserId = function (req, res, callback) {
		var userId = req.params.uid;
		console.log("[DBGroups] FindByUID: '" + req.params.uid + "'");
		if (userId) {
			collectionGroups.find({
				creatorid: userId
			}).toArray(function (err, result) {
				if (err) {
					console.error("[DBGroups] FindByUID: " + err.message);
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
			console.warn("[DBGroups] FindByUID: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find group based on query
	DBGroups.find = function (req, res, callback) {
		var query = req.body;
		console.log("[DBGroups] Find: '" + JSON.stringify(query) + "'");
		if (!Object.keys(query).length) {
			collectionGroups.find(query, function (err, result) {
				if (err) {
					console.error("[DBGroups] Find:" + err.message);
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
			console.warn("[DBGroups] Find: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};


	//Update group
	DBGroups.update = function (req, res, callback) {
		var groupId = req.body.gid;
		var updates = req.body.updates;
		console.log("[DBGroups] Update: '" + JSON.stringify(updates) + "'->'" + groupId + "'");
		if (groupId && updates) {
			collectionGroups.update({
				_id: groupId
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBGroups] Update: " + err.message);
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
			console.warn("[DBGroups] Update: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Remove a group
	DBGroups.remove = function (req, res, callback) {
		var groupid = req.params.gid;
		console.log("[DBGroups] Remove: '" + groupid + "'");
		if (groupid) {
			collectionGroups.remove({
				_id: groupid
			}, function (err, result) {
				if (err) {
					console.error("[DBGroups] Remove: " + err.message);
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
			console.warn("[DBGroups] Remove: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};