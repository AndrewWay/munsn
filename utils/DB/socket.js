var console = require('../consoleLogger');
module.exports = function (DBSocket, collectionSocket, collectionMessages) {

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
		console.log("[DBSocket] FindSid", "'" + socketid + "'");
		collectionSocket.findOne({
			socketid: socketid
		}, function (err, result) {
			if (err) {
				console.error("[DBSocket] Find", err.message);
				callback(err, result);
			} else {
				callback(err, result);
			}
		});
	};

	//Find users matching query
	DBSocket.findUid = function (uid, callback) {
		console.log("[DBSocket] FindUid", "'" + uid + "'");
		collectionSocket.findOne({
			_id: uid
		}, function (err, result) {
			if (err) {
				console.error("[DBSocket] Find", err.message);
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

	//Save a message to the collectionMessages
	//Will check to see if the message object exists in the collection, if not then insert and update
	DBSocket.saveMessage = function (sender, reciever, msg, callback) {
		console.log("[DBSocket] SaveMessage", "'{sender:'" + sender + "'}->{reciever:'" + reciever + "', message:'" + msg + "}");
		//Find the doc first
		collectionMessages.findOne({users: {$all: [sender, reciever]}}, function(findErr, findResult) {
			if (findErr) {
				console.error("[DBSocket] SaveMessage: FindOne", findErr.message);
				callback(findErr, findResult);
			} else {
				console.log("MESSAGE RESULT: " + JSON.stringify(findResult));	
				//If found then continue with _id
				if (findResult) {
					collectionMessages.update({_id: findResult._id}, {$addToSet: {users: {$each: [sender, reciever]}}, $push: {messages: msg}}, function(updateErr, updateResult) {
						if (updateErr) {
							console.error("[DBSocket] SaveMessage: UpdateWithId", updateErr.message);
							callback(updateErr, updateResult);
						}
						else {
							console.log("[DBSocket] SaveMessage: UpdateWithId", updateResult);
							callback(updateErr, updateResult);	
						}
					});
				}
				//Else use query
				else {
					collectionMessages.update({users: {$all: [{$elemMatch: {sender}}, {$elemMatch: {reciever}}]}}, {$addToSet: {users: {$each: [sender, reciever]}}, $push: {messages: msg}}, {upsert: true}, function(updateErr, updateResult) {
						if (updateErr) {
							console.error("[DBSocket] SaveMessage: UpdateWithQuery", updateErr.message);
							callback(updateErr, updateResult);
						}
						else {
							console.log("[DBSocket] SaveMessage: UpdateWithQuery", updateResult);
							callback(updateErr, updateResult);	
						}
					});
				}
			}
		});
	};
};

//		collectionMessages.findAndModify({users: {$all: [{$elemMatch: {sender} }, {$elemMatch: {reciever}}]}}, [['users', 'ascending']], {$addToSet: {users: {$each: [sender, reciever]}}, $push: {messages: msg}}, {upsert: true, new: true}, function(err, result) {
