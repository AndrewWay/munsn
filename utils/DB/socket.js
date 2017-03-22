module.exports = function (DBSocket, collectionSocket) {

	//Updates the user
	DBSocket.update = function (uid, updates, callback) {
		console.log("[DBSocket] Update: '" + updates + "'->'" + uid + "'");
			collectionSocket.update({_id: uid}, {$set: updates}, {upsert: true}, function (err, result) {
				if (err) {
					console.error("[DBSocket] Update: " + err.message);
					callback(err, result);
				} else {
					callback(err, result);
				}
			});
	};

    	//Find users matching query
	DBSocket.find = function (socketid, callback) {
		console.log("[DBSocket] Find: '" + socketid  + "'");
		collectionSocket.findOne({socketid: socketid}, function (err, result) {
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
		console.log("[DBSocket] Find: '" + socketid  + "'");
		collectionSocket.findAndModify({_id: uid}, [['_id', 'ascending']], {$set: {socketid: socketid}}, {upsert: true, new: true}, function (err, result) {
            if (err) {
                console.error("[DBSocket] Find: " + err.message);
                callback(err, result);
            } else {
                callback(err, result);
            }
		});
	};
}