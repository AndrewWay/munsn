module.exports = function (DBLostFound, collectionLost) {

	//Add a lost
	DBLostFound.add = function (req, res, callback) {
		var lost = {
			imagePath: req.body.imagePath,
			description: req.body.description,
			long: req.body.long,
			lat: req.body.lat
		};
		//TODO: DEVIN, THIS COURSE VARIABLE IS NOT DEFINED.
		console.log("[DBLost] Add: '" + course.label);
		collectionLost.insert(lost, function (err, result) {
			if (err) {
				console.error("[DBLost] Add: " + err.message);
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

	//Find a lost by unique lost id
	DBLostFound.findById = function (req, res, callback) {
		console.log("[DBLost] FindById: '" + req.params.uid + "'");
		if (req.params.uid) {
			collectionLost.findOne({
				_id: req.params.uid
			}, function (err, result) {
				if (err) {
					console.log("[DBLost]: " + err.message);
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
			console.error("[DBLost] FindById: Missing Fields");
			callback({
				session: req.session,
				status: 'fail'
			});
		}
	};

	//Find lost matching query
	DBLostFound.find = function (req, res, callback) {
		console.log("[DBLost] Find: '" + JSON.stringify(req.body) + "'");
		collectionLost.find(req.body).toArray(function (err, result) {
			if (err) {
				console.error("[DBLost]: " + err.message);
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

	//Updates the lost
	DBLostFound.update = function (req, res, callback) {
		console.log("[DBLost] Update: '" + JSON.stringify(req.body) + "'->'" + req.params.uid + "'");
		if (req.params.uid) {
			var updates = {
				imagePath: req.body.imagePath,
				description: req.body.description,
				long: req.body.long,
				lat: req.body.lat
			};
			collectionLost.update({
				_id: req.params.uid
			}, {
				$set: updates
			}, {
				upsert: true
			}, function (err, result) {
				if (err) {
					console.error("[DBLost] Update: " + err.message);
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
			console.warn("[DBLost] Update: Missing Fields");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};

	//Removes the course
	DBLostFound.remove = function (req, res, callback) {
		console.log("[DBLost] Remove: '" + req.params.uid + "'");
		if (req.params.uid) {
			collectionLost.remove({
				_id: req.params.id
			}, {
				single: true
			}, function (err, result) {
				if (err) {
					console.error("[DBLost] Remove: " + err.message);
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
			console.warn("[DBLost] Remove: Missing Fields");
			callback({
				session: req.session,
				status: "fail"
			});
		}
	};
};