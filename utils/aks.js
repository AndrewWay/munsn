var DB = require('./db');
var utils = require('./utils');
/**
 * This function takes a key and validates it, reacts accordingly.
 * If the key is not found, nothing happens.
 * If the key is found, and is expired, a new one is made and sent via email.
 * If the key is found, isn't expired, the user is registered and the authkey row is dropped
 * @param {string} key
 * @param {function} callback
 */
var validate = function (key, callback) {
	//Check if auth key exists
	DB.Auth.find(key, function (result) {
		//console.log(JSON.stringify(checkResult));
		if (result.data) {
			var auth = result.data;
			console.log("[AKS]: 'Found'->'" + auth.key + "'");
			var date = new Date();
			var userid = auth.userid;
			//Check to see if key expired
			//If not then auth the user, and delete the key from regauths
			if (date.getTime() <= auth.expiry) {
				console.log("[AKS]: 'Valid'->'" + auth.userid + "'");
				DB.Auth.remove(auth, function (result) {
					if (result.status === 'ok') {
						callback(true, result);
					} else {
						callback(false, result);
					}
				});
			} else {
				//If key expired, then send a new key with a new email
				console.warn("[AKS]: 'Expired'->'" + auth.userid + "'");
				console.log("[AKS]: 'New'->'" + auth.userid + "'");
				//Create relevant data
				date = new Date();
				auth = {
					userid: userid,
					key: userid + date.getTime(),
					expiry: utils.addMinsToDate(date, DB.MAX_VALIDATE_MINUTES).getTime()
				};
				//Send the updated data to the database and update it
				DB.Auth.update(auth, function (result) {
					if (result.status === 'ok') {
						callback(true, result);
					} else {
						callback(false, result);
					}
				});
			}
		} else {
			console.error("[AKS]: 'Invalid'->'" + JSON.stringify(result.data) + "'");
			callback(false, result);
		}
	});
};
exports.validate = validate;