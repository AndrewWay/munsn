var console = require('../consoleLogger');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (DBCourses, collectionCourses, collectionUserCourses, collectionGroupCourses) {
	//Add a course
	DBCourses.createCourse = function (req, res, callback) {
		var course = {
			label: req.body.label,
			name: req.body.name,
			description: req.body.description,
			semester: req.body.semester,
			department: req.body.department,
			location: req.body.location,
			year: req.body.year,
			cid: req.body.cid,
			days: req.body.days,
			timeStart: new Date(req.body.timeStart),
			timeEnd: new Date(req.body.timeEnd)
		};
		console.log("[DBCourses] CreateCourse", "'" + course.label + "'");
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
					status: 'ok'
				});
			}
		});
	};

	//Find a course by unique course id
	DBCourses.findById = function (req, res, callback) {
		console.log("[DBCourses] FindById", "'" + req.params.id + "'");
		if (req.params.id) {
			collectionCourses.findOne({
				_id: new ObjectID(req.params.id)
			}, function (err, result) {
				if (err) {
					console.log("[DBCourses]", err.message);
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
			console.error("[DBCourses] FindById", "'Missing Fields'");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find courses matching query
	DBCourses.find = function (req, res, callback) {
		console.log("[DBCourses] Find", "'" + JSON.stringify(req.body) + "'");
		collectionCourses.find(req.body).toArray(function (err, result) {
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
				label: req.body.label,
				name: req.body.name,
				description: req.body.description,
				semester: req.body.semester,
				department: req.body.department,
				location: req.body.location,
				year: req.body.year,
				cid: req.body.cid,
				days: req.body.days,
				timeStart: req.body.timeStart,
				timeEnd: req.body.timeEnd
			};
			Object.keys(updates).forEach(k => {
				if (req.body[k] === undefined) {
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
		console.log("[DBCourses] AddToUser", "'" + req.body.uid + "'-> " + req.body.cid);
		if (req.body.uid && req.body.cid) {
			collectionUserCourses.update({
				_id: req.body.uid
			}, {
				$addToSet: {
					courses: req.body.cid
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
					callback({
						session: req.session,
						status: 'ok'
					});
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
		console.log("[DBCourses] RemoveFromUser", "'" + req.body.uid + "'-> " + req.body.cid);
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
		console.log("[DBCourses] AddToGroup", "'" + req.body._id + "'-> " + req.body.cid);
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
		console.log("[DBCourses] removeFromGroup", "'" + req.body._id + "'-> " + req.body.cid);
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