module.exports = function (DBCourses, collectionCourses) {
	//Add a course
	DBCourses.add = function (req, res, callback) {
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
			timeStart: req.body.timeStart,
			timeEnd: req.body.timeEnd
		};
		console.log("[DBCourses] Add: '" + course.label);
		collectionCourses.insert(course, function (err, result) {
			if (err) {
				console.error("[DBCourses] Add: " + err.message);
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
		console.log("[DBCourses] FindById: '" + req.params.uid + "'");
		if (req.params.uid) {
			collectionCourses.findOne({
				_id: req.params.uid
			}, function (err, result) {
				if (err) {
					console.log("[DBCourses]: " + err.message);
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
			console.error("[DBCourses] FindById: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find courses matching query
	DBCourses.find = function (req, res, callback) {
		console.log("[DBCourses] Find: '" + JSON.stringify(req.body) + "'");
		collectionCourses.find(req.body).toArray(function (err, result) {
			if (err) {
				console.error("[DBCourses]: " + err.message);
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
		console.log("[DBCourses] Update: '" + JSON.stringify(req.body) + "'->'" + req.params.uid + "'");
		if (req.params.uid) {
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
			collectionCourses.update({
				_id: req.params.uid
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] Update: " + err.message);
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
			console.warn("[DBCourses] Update: Missing Fields");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Removes the course
	DBCourses.remove = function (req, res, callback) {
		console.log("[DBCourses] Remove: '" + req.params.uid + "'");
		if (req.params.uid) {
			collectionCourses.remove({
				_id: req.params.id
			}, {
				single: true
			}, function (err, result) {
				if (err) {
					console.error("[DBCourses] Remove: " + err.message);
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
			console.warn("[DBCourses] Remove: Missing Fields");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};
};