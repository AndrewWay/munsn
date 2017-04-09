var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBCourses, collectionCourses, collectionUserCourses, collectionGroupCourses) {
	//Add a course
	DBCourses.add = function (req, res, callback) {
		var course = {
			label: undefined,
			description: undefined,
			name: undefined,
			semester: undefined,
			location: undefined,
			department: undefined,
			year: undefined,
			cid: undefined,
			event: undefined
		};
		Object.keys(course).forEach(k => {
			if (!req.body[k]) {
				delete course[k];
			} else {
				course[k] = req.body[k];
			}
		});
		console.log("[DBCourses] CreateCourse", "'" + JSON.stringify(course) + "'");
		collectionCourses.insert(course, function (err, result) {
			if (err) {
				console.error("[DBCourses] CreateCourse", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				callback({
					session: req.session,
					data: result.ops[0],
					status: 'ok'
				});
			}
		});
	};

	//Find a course by unique course id
	DBCourses.findByUserID = function (req, res, callback) {
		console.log("[DBCourses] FindByUserID", "'" + req.UserID + "'");
		if (req.UserID) {
			collectionUserCourses.findOne({
				_id: req.UserID
			}, function (fErr, fResult) {
				if (fErr) {
					console.log("[DBCourses] FindByUserID", fErr.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					if (!fResult) {
						console.log("[DBCourses] FindByUserID->Result", "'NO Results'");
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						fResult.courses.forEach((v, i) => {
							fResult.courses[i] = new ObjectID(v);
						});
						collectionCourses.find({
							_id: {
								$in: fResult.courses
							}
						}).toArray(function (cErr, cResult) {
							if (cErr) {
								console.log("[DBCourses] FindByUserID->Courses", cErr.message);
								callback({
									session: req.session,
									status: 'fail'
								});
							} else {
								callback({
									session: req.session,
									status: 'ok',
									data: cResult
								});
							}
						});

					}
				}
			});
		} else {
			console.error("[DBCourses] FindById", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find courses matching query
	DBCourses.find = function (req, res, callback) {
		var body = Object.assign({}, req.body, req.query);
		var query = {
			label: undefined,
			description: undefined,
			name: undefined,
			semester: undefined,
			location: undefined,
			department: undefined,
			year: undefined,
			cid: undefined,
			event: undefined
		};
		Object.keys(query).forEach(k => {
			if (!body[k]) {
				delete query[k];
			} else {
				query[k] = body[k];
			}
		});
		console.log("[DBCourses] Find", "'" + JSON.stringify(query) + "'");
		collectionCourses.find(query).toArray(function (err, result) {
			if (err) {
				console.error("[DBCourses]", err.message);
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

	//Updates the course
	DBCourses.update = function (req, res, callback) {
		console.log("[DBCourses] Update", "'" + JSON.stringify(req.body) + "'->'" + req.params.uid + "'");
		if (req.body._id) {
			var updates = {
				label: undefined,
				description: undefined,
				name: undefined,
				semester: undefined,
				location: undefined,
				department: undefined,
				year: undefined,
				cid: undefined,
				event: undefined
			};
			Object.keys(updates).forEach(k => {
				if (!req.body[k]) {
					delete updates[k];
				} else {
					updates[k] = req.body[k];
				}
			});
			collectionCourses.update({
				_id: new ObjectID(req.body._id)
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] Update", err.message);
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
			console.warn("[DBCourses] Update", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Removes the course
	DBCourses.delete = function (req, res, callback) {
		console.log("[DBCourses] Remove", "'" + req.body._id + "'");
		if (req.body._id) {
			collectionCourses.remove({
				_id: new ObjectID(req.body._id)
			}, {
				single: true
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] Remove", err.message);
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
			console.warn("[DBCourses] Remove", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	DBCourses.addToUser = function (req, res, callback) {
		var body = Object.assign({}, req.body, req.query);
		console.log("[DBCourses] AddToUser", "'" + body.uid + "'->'" + body.cid + "'");
		if (body.uid && body.cid) {
			collectionUserCourses.update({
				_id: body.uid
			}, {
				$addToSet: {
					courses: body.cid
				}
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] AddToUser", err.message);
					callback({
						session: req.session,
						status: 'fail'
					});
				} else {
					if (!result.length) {
						console.error("[DBCourses] AddToUser->Results", "'NO Results'");
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						callback({
							session: req.session,
							data: result.ops[0],
							status: 'ok'
						});
					}
				}
			});
		} else {
			console.warn("[DBCourses] AddToUser", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	DBCourses.removeFromUser = function (req, res, callback) {
		console.log("[DBCourses] RemoveFromUser", "'" + req.body.uid + "'->'" + req.body.cid + "'");
		if (req.body.uid && req.body.cid) {
			collectionUserCourses.update({
				_id: req.body.uid
			}, {
				$pull: {
					courses: req.body.cid
				}
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] RemoveFromUser", err.message);
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
			console.warn("[DBCourses] RemoveFromUser", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	DBCourses.addToGroup = function (req, res, callback) {
		console.log("[DBCourses] AddToGroup", "'" + req.body._id + "'->'" + req.body.cid + "'");
		if (req.body._id && req.body.cid) {
			collectionGroupCourses.update({
				_id: req.body._id
			}, {
				$addToSet: {
					courses: req.body.cid
				}
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] AddToGroup", err.message);
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
			console.warn("[DBCourses] AddToGroup", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	DBCourses.removeFromGroup = function (req, res, callback) {
		console.log("[DBCourses] removeFromGroup", "'" + req.body._id + "'->'" + req.body.cid + "'");
		if (req.body._id && req.body.cid) {
			collectionGroupCourses.update({
				_id: req.body._id
			}, {
				$pull: {
					courses: req.body.cid
				}
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] removeFromGroup", err.message);
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
			console.warn("[DBCourses] removeFromGroup", "'Missing Fields'");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};
};