var utils = require('../utils');
var console = require('../consoleLogger');
module.exports = function (DBUsers, DBAuth, collectionUsers) {
	DBUsers.add = function (req, res, callback) {

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
				_id: utils.EmailToID(req.body.email)
			};
			for (var k in Object.keys(row)) {
				if (row[k] === undefined) {
					delete row[k];
				}
			}
			console.log("[DBUsers] Add", "'" + JSON.stringify(row) + "'");
			if (Object.keys(row).length !== 10) {
				console.warn("[DBUsers] Add", "'Missing Fields'");
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				//Create auth key and store it in auths
				collectionUsers.insert(row, function (err, result) {
					if (err) {
						console.error("[DBUsers] Add", err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						console.log("[DBUsers] Add->Insert", "'" + result.insertedIds[0] + "'");
						DBAuth.add(req, res, row, function (result) {
							callback(result);
						});
					}
				});
			}
		} catch (err) {
			console.error("[DBUsers] Registration", "'Missing fields or Other'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}

	};

	//Find a user by unique object id
	DBUsers.findById = function (req, res, callback) {
		console.log("[DBUsers] FindById", "'" + req.UserID + "'");
		if (req.UserID) {
			collectionUsers.findOne({
				_id: req.UserID
			}, function (err, result) {
				if (err) {
					console.log("[DBUsers] FindById", err.message);
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
			console.error("[DBUsers] FindById", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find users matching query
	DBUsers.find = function (req, res, callback) {
		console.log("[DBUsers] Find", "'" + JSON.stringify(req.query) + "'");
		collectionUsers.find(req.body).toArray(function (err, result) {
			if (err) {
				console.error("[DBUsers] Find", err.message);
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
		console.log("[DBUsers] Update", "'" + JSON.stringify(req.body) + "'->'" + req.UserID + "'");
		if (req.UserID) {
			var updates = {
				pass: undefined,
				email: undefined,
				visibility: undefined,
				address: undefined,
				gender: undefined,

			};
			Object.keys(updates).forEach(k => {
				if (req.body[k] === undefined) {
					delete updates[k];
				} else {
					updates[k] = req.body[k];
				}
			});
			collectionUsers.update({
				_id: req.UserID
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBUsers] Update", err.message);
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
			console.warn("[DBUsers] Update", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Removes the user
	DBUsers.remove = function (req, res, callback) {
		console.log("[DBUsers] Remove", "'" + req.UserID + "'");
		if (req.UserID) {
			collectionUsers.remove({
				_id: req.UserID
			}, {
				single: true
			}, function (err, result) {
				if (err) {
					console.error("[DBUsers] Remove", err.message);
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
			console.warn("[DBUsers] Remove", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	DBUsers.logout = function (req, res, callback) {
		//TODO: Maybe in the future we need this.
		var User = req.session.user;
		if (User) {
			req.session.destroy();
			console.log("[DBUsers] Logout", "'" + User._id + "'");
			callback({
				status: 'ok'
			});
		} else {
			console.log("[DBUsers] Logout", "'No Session'");
			callback({
				status: 'fail'
			});
		}
	};
	DBUsers.login = function (req, res, callback) {
		console.log("[DBUsers] Login", "'" + JSON.stringify(req.body) + "'");
		if (req.session.user) {
			console.warn("[SESSION]", "'Exists'->'" + JSON.stringify(req.session.user) + "'");
			callback({
				session: req.session,
				status: 'ok'
			});
		} else {
			if (req.body.uid && req.body.pass) {
				collectionUsers.findOne({
					_id: req.body.uid
				}, function (err, result) {
					if (err) {
						console.error("[DBUsers] Login", err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						if (result) {
							console.log("[DBUsers] Login", "'Found'->'" + JSON.stringify(result) + "'");
							if (result.pass === req.body.pass) {
								console.log("[DBUsers] Login->Password?", "'" + result.pass + "'->'" + req.body.pass + "'");
								if (result.auth) {
									console.log("[DBUsers] Login->isAuth?", " 'Success'->'" + result._id + "'");
									req.session.user = result;
									console.log("[SESSION]", "'Created'->'" + JSON.stringify(req.session) + "'");
									callback({
										session: req.session,
										status: 'ok'
									});
								} else {
									console.warn("[DBUsers] Login->isAuth?", "'Failed'->'" + result._id + "'");
									callback({
										session: req.session,
										status: 'fail'
									});
								}
							} else {
								console.warn("[DBUsers] Login->Password?", "'" + result.pass + "'->'" + req.body.pass + "'");
								callback({
									session: req.session,
									status: 'fail'
								});
							}
						} else {
							console.warn("[DBUsers] Login", "'NotFound'->'" + req.body.uid + "'");
							callback({
								session: req.session,
								status: 'fail'
							});
						}
					}
				});
			} else {
				console.warn("[DBUsers] Login", "'Missing fields'");
				callback({
					session: req.session,
					status: 'fail'
				});
			}
		}
	};
};