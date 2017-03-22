var console = require('../consoleLogger');
module.exports = function (DBSocket, collectionSocket) {

	//Updates the user
	DBSocket.update = function (uid, updates, callback) {
		console.log("[DBSocket] Update", "'" + JSON.stringify(updates) + "'->'" + uid + "'");
		collectionSocket.update({
			_id: uid
		}, {
			$set: updates
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.error("[DBSocket] Update", err.message);
				callback(err, result);
			} else {
				callback(err, result);
			}
		});
	};

	//Find users matching query
	DBSocket.find = function (socket, callback) {
		console.log("[DBSocket] Find", "'" + JSON.stringify(socket) + "'");
		collectionSocket.find({
			socket: socket
		}).toArray(function (err, result) {
			if (err) {
				console.error("[DBSocket] Find", err.message);
				callback(err, result);
			} else {
				callback(err, result);
			}
		});
	};
}