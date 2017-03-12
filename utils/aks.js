var DB = require('./db');
var utils = require('./utils');

exports.validate = function (key, callback) {
	//Check if auth key exists
	DB.auth_findAuthKey(key, function(checkResult) {
		//console.log(JSON.stringify(checkResult));
		if (checkResult) {
			console.log("[ROUTER] /auth: Found authkey for key: " + checkResult.authkey);
			var currentDate = new Date();
			var id = checkResult.userId;
			//Check to see if key expired
			//If not then auth the user, and delete the key from regauths
			if (currentDate.getTime() <= checkResult.expiry) {
				console.log("[ROUTER] /auth: authkey is valid");
				DB.auth_deleteAuthKey(checkResult.authkey, function(deleteResult) {
					DB.users_updateUser(id, {auth: true}, function(updateResult) {
						console.log("ROUTER: /auth: User updated");
					});
				});
				callback(true);
			}
			//If key expired, then send a new key with a new email
			else {
				console.log("[ROUTER] /auth: authkey is expired");
				console.log("[ROUTER] /auth: sending new email to user " + checkResult.userId);
				//Get user entry from DB
				DB.users_findUserById(id, function (userResult) {
					//Create relevant data
					var date = new Date();
					var authkey = id + date.getTime();
					var mins = 1;
					//Send the updated data to the database and update it
					DB.auth_updateAuthKey(userResult, authkey, utils.addMinsToDate(date, mins).getTime(), function(result) {
						console.log(result);
					});
				});
				callback(false,checkResult);
			}
		}
		else {
			console.log("[ROUTER]: /auth: No such authkey for key: " + key);
			callback(false, checkResult);
		}
	});
}