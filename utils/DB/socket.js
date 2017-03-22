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
	DBSocket.findSid = function (socketid, callback) {
		console.log("[DBSocket] Find: '" + socketid + "'");
		collectionSocket.findOne({
			socketid: socketid
		}, function (err, result) {
			if (err) {
				console.error("[DBSocket] Find: " + err.message);
				callback(err, result);
			} else {
				callback(err, result);
			}
		});
	};

	//Find users matching query
	DBSocket.findUid = function (uid, callback) {
		console.log("[DBSocket] Find: '" + uid + "'");
		collectionSocket.findOne({
			_id: uid
		}, function (err, result) {
			if (err) {
				console.error("[DBSocket] Find: " + err.message);
				callback(err, result);
			} else {
				callback(err, result);
			}
		});
	};

	//Find users matching query
	DBSocket.findAndUpdate = function (uid, socketid, callback) {
		console.log("[DBSocket] FindAndUpdate", "'{socketid:'" + socketid + "'}->{_id:'" + uid + "'}");
		collectionSocket.findAndModify({
			_id: uid
		}, [
			['_id', 'ascending']
		], {
			$set: {
				_id: uid,
				socketid: socketid
			}
		}, {
			upsert: true,
			new: true
		}, function (err, result) {
			if (err) {
				console.error("[DBSocket] FindAndUpdate", err.message);
				callback(err, result);
			} else {
				callback(err, result);
			}
		});
	};
};