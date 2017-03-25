var console = require('../consoleLogger');
module.exports = function (DBGroupAdmins, collectionGroupAdmins) {
	//Add admin to group
	DBGroupAdmins.add = function (req, res, callback) {
		var groupId = req.body.gid;
		var adminId = req.body.uid;
		console.log("[DBGroupAdmins] Add", "'" + adminId + "'->'" + groupId + "'");
		if (groupId && adminId) {
			collectionGroupAdmins.update({
				_id: groupId
			}, {
				$push: {
					admins: adminId
				}
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBGroupAdmins] Add", err.message);
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
			console.warn("[DBGroupAdmins] Add", "Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Finds all admins of a group and returns it as an array
	DBGroupAdmins.find = function (req, res, callback) {
		var groupId = req.params.gid;
		console.log("[DBGroupAdmins] Find", "'" + groupId + "'");
		if (groupId) {
			collectionGroupAdmins.find({
				_id: groupId
			}, {
				admins: true
			}).toArray(function (err, result) {
				if (err) {
					console.error("[DBGroupsAdmins] Find", "" + err.message);
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
			console.warn("[DBGroupsAdmins] Find", "Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Removes admin from group
	DBGroupAdmins.remove = function (req, res, callback) {
		var groupId = req.body.gid;
		var adminId = req.body.uid;
		console.log("[DBGroupAdmins] Remove", "'" + adminId + "'->'" + groupId + "'");
		if (groupId && adminId) {
			collectionGroupAdmins.update({
				_id: groupId
			}, {
				$pull: {
					admins: adminId
				}
			}, function (err, result) {
				if (err) {
					console.error("[DBGroupAdmins] Remove", err.message);
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
			console.warn("[DBGroupAdmins] Remove", "Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};
};