var utils = require('../utils');

module.exports = function (DBUsers, DBAuth, collectionUsers) {
	DBUsers.add = function (req, res, callback) {
		console.log("[DBUsers] Add: '" + JSON.stringify(req.body) + "'");
		var result = {};
		if (!Object.keys(req.body).length) {
			console.warn("[DBUsers] Add: Missing Data");
			callback({
				session: req.session,
				status: 'fail'
			});
		} else {
			//Create user
			try {
				var row = {
					fname: req.body.fname,
					lname: req.body.lname,
					pass: req.body.pass,
					dob: new Date(req.body.dob),
					address: req.body.address,
					gender: req.body.gender,
					email: req.body.email,
					auth: false,
					visibility: req.body.visibility ? req.body.visibility : "default",
					_id: utils.getIdFromEmail(req.body.email)
				};

				//Create auth key and store it in auths
				collectionUsers.insert(row, function (err, result) {
					if (err) {
						console.error("[DBUsers] Add: " + err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						console.log("[DBUsers] Inserted: '" + result.insertedIds[0] + "'");
						DBAuth.add(req, res, row, function (result) {
							callback(result);
						});
					}
				});
			} catch (err) {
				console.error("[DBUsers] Registration: Missing fields or other error");
				callback({
					session: req.session,
					status: 'fail'
				});
			}
		}
	};

	//Find a user by unique object id
	DBUsers.findById = function (req, res, callback) {
		console.log("[DBUsers] FindById: '" + req.params.uid + "'");
		if (req.params.uid) {
			collectionUsers.findOne({
				_id: req.params.uid
			}, function (err, result) {
				if (err) {
					console.log("[DBUsers]: " + err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					//Returns null if error occured
					callback({
						session: req.session,
						status: 'ok',
						data: result
					});
				}
			});
		} else {
			console.error("[DBUsers] FindById: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find users matching query
	DBUsers.find = function (req, res, callback) {
		console.log("[DBUsers] Find: '" + JSON.stringify(req.body) + "'");
		collectionUsers.find(req.body).toArray(function (err, result) {
			if (err) {
				console.error("[DBUsers]: " + err.message);
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

	//Updates the user
	DBUsers.update = function (req, res, callback) {
		console.log("[DBUsers] Update: '" + JSON.stringify(req.body) + "'->'" + req.params.uid + "'");
		if (req.params.uid) {
			var updates = {
				pass: req.body.pass,
				email: req.body.email,
				visibility: req.body.visibility,
				address: req.body.address
			};
			collectionUsers.update({
				_id: req.params.uid
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBUsers] Update: " + err.message);
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
			console.warn("[DBUsers] Update: Missing Fields");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Removes the user
	DBUsers.remove = function (req, res, callback) {
		console.log("[DBUsers] Remove: '" + req.params.uid + "'");
		if (req.params.uid) {
			collectionUsers.remove({
				_id: req.params.id
			}, {
				single: true
			}, function (err, result) {
				if (err) {
					console.error("[DBUsers] Remove: " + err.message);
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
			console.warn("[DBUsers] Remove: Missing Fields");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	DBUsers.login = function (req, res, callback) {
		console.log("[DBUsers] Login: '" + req.body.uid + "'");
		if (req.session.user) {
			console.log("[SESSION]: 'Exists'->'" + JSON.stringify(req.session.user) + "'");
			callback({
				session: req.session,
				status: 'ok'
			});
		} else {
			if (req.body.uid && req.body.pass) {
				collectionUsers.find({
					_id: req.body.uid,
					pass: req.body.pass
				}).toArray(function (err, results) {
					console.log("results: " + JSON.stringify(results));
					if (err && results.length) {
						callback({
							session: req.session,
							status: 'fail'
						});
						console.error("[DBUsers] Login: 'NotFound'->'" + req.body.uid + "'");
					} else {
						req.session.user = results[0];
						callback({
							session: req.session,
							status: 'ok'
						});
						console.log("[SESSION]: 'Created'->'" + JSON.stringify(req.session) + "'");
					}
				});
			} else {
				console.warn("[DBUsers] Login: Missing fields");
				callback({
					session: req.session,
					status: 'fail'
				});
			}
		}
	};
};