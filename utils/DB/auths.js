var EMS = require('../ems');
var utils = require('../utils');
var console = require('../consoleLogger');
/**
 * @param {object} DBAuth
 * @param {object} collectionAuths
 * @param {object} collectionUsers
 * @param {number} MAX_VALIDATE_MINUTES
 */
module.exports = function (DBAuth, collectionAuths, collectionUsers, MAX_VALIDATE_MINUTES) {
	DBAuth.add = function (req, res, row, callback) {
		var date = new Date();
		var authkey = row._id + date.getTime();
		var expiry = utils.addMinsToDate(date, MAX_VALIDATE_MINUTES).getTime();
		//user, authkey, utils.addMinsToDate(date, mins).getTime()
		var auth = {
			userid: row._id,
			key: authkey,
			expiry: expiry
		};
		console.log("[DBAuth] Add", "'" + JSON.stringify(auth) + "'");
		collectionAuths.insert(auth, function (err, result) {
			if (err) {
				console.error("[DBAuth] Add", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				//Send auth email to the user with the auth link
				EMS.sendAuthEmail(auth, function (err, message) {
					if (err) {
						console.error('[EMS]', err);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						console.log('[EMS] Sent To', message.header.to);
						console.log('[EMS] Subject', message.header.subject);
						callback({
							session: req.session,
							data: {
								_id: auth.userid
							},
							status: 'ok'
						});
					}
				});
			}
		});

	};
	DBAuth.update = function (req, res, auth, callback) {
		console.log("[DBAuth] Update", "'" + JSON.stringify(auth) + "'->'" + auth.userid + "'");
		collectionAuths.update({
			userid: auth.userid
		}, {
			$set: auth
		}, {
			upsert: true
		}, function (err, result) {
			if (err) {
				console.error("[DBAuth] Update", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				EMS.resendAuthEmail(auth, function (err, message) {
					if (err) {
						console.error("[EMS]", err);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						console.log('[EMS] To', message.header.to);
						console.log('[EMS] Subject', message.header.subject);
						callback({
							session: req.session,
							status: 'ok'
						});
					}
				});
			}
		});
	};
	//Check for an existing authkey
	DBAuth.find = function (req, res, callback) {
		console.log("[DBAuth] Find", "'" + req.query.key + "'");
		collectionAuths.findOne({
			key: req.query.key
		}, function (err, result) {
			if (err) {
				console.error("[DBAuth] Find", err.message);
				callback({
					session: req.session,
					status: 'fail',
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

	//Delete authkey
	DBAuth.remove = function (req, res, auth, callback) {
		console.log("[DBAuth] Remove", "'" + auth.key + "'->'" + auth.userid + "'");
		collectionAuths.remove(auth, {
			single: true
		}, function (err, result) {
			if (err) {
				console.error("[DBAuth] Remove", err.message);
				callback({
					session: req.session,
					status: 'fail'
				});
			} else {
				collectionUsers.findOneAndUpdate({
					_id: auth.userid
				}, {
					$set: {
						auth: true
					}
				}, {
					upsert: true
				}, function (err, result) {
					if (err) {
						console.error("[DBAuth] Remove", err.message);
						callback({
							session: req.session,
							status: 'fail'
						});
					} else {
						console.log("[DBAuth] Remove->Update", "'{auth:'true'}'->'" + auth.userid + "'");
						req.session.user = result.value;
						callback({
							session: req.session,
							status: 'ok'
						});
					}
				});
			}
		});
	};
};