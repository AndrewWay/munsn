var fs = require('fs');
var path = require('path');
var googleFuncs = require('../googleFuncs');
var googleapi = require('googleapis');
var calendar = googleapi.calendar('v3');
var MUNSNCal = {};
MUNSNCal.add = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.calendars.insert({
			auth: key,
			resource: {
				summary: data.uid
			}
		}, function (err, result) {
			var acl = {
				calendarId: result.id,
				role: 'writer',
				type: 'user',
				value: data.uid + '@mun.ca'
			};
			MUNSNCal.addACL({
				calendarId: acl.calendarId
			});
			MUNSNCal.addACL(acl);
			callback(err, result);
		});
	});
};
MUNSNCal.addACL = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.acl.insert({
			auth: key,
			calendarId: data.calendarId,
			resource: {
				role: data.role || 'reader',
				scope: {
					type: data.type || 'default',
					value: data.value || undefined
				}
			}
		}, callback);
	});
};
MUNSNCal.removeACL = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.acl.delete({
			auth: key,
			calendarId: data.calendarid,
			ruleId: 'user:' + data.rid + '@mun.ca'
		}, callback);
	});
};
MUNSNCal.addEvent = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.events.insert({
			auth: key,
			calendarId: data.calendarid,
			resource: {}
		}, callback);
	});
};
MUNSNCal.updateEvent = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.events.update({
			auth: key,
			calendarId: data.calendarid,
			resource: {

			}
		});
	});
};
MUNSNCal.removeEvent = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.events.remove({
			auth: key,
			calendarId: data.calendarid,
			resource: {

			}
		}, callback);
	});
};
MUNSNCal.remove = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.calendars.delete({
			auth: key,
			calendarId: data.calendarid
		}, callback);
	});
};

module.exports = function (DBCalendar, collectionCalendar) {
	DBCalendar.add = function (req, res, callback) {
		console.log("[DBCalendar] Add: '" + req.params.uid + "'");
		googleFuncs.getKey(function (key) {
			collectionCalendar.findOne({
				_id: req.params.uid
			}, function (err, result) {
				if (err) {
					console.log("[DBCalendar] Add: " + err.message);
					callback({
						status: 'fail'
					});
				} else {
					if (!result) {
						MUNSNCal.add({
							uid: req.params.uid
						}, function (err, result) {
							if (err) {
								console.log("[DBCalendar] Add: '" + err.message + "'");
								callback({
									status: 'fail'
								});
							} else {
								collectionCalendar.insert({
									_id: req.params.uid,
									calendarid: result.id
								}, function (err, result) {
									if (err) {
										console.log("[DBCalendar] Add: '" + JSON.stringify(err) + "'");
										callback({
											status: 'err'
										});
									} else {
										console.log("[DBCalendar] Add: '" + JSON.stringify(result) + "'->'" + req.params.uid + "'");
										callback({
											data: result,
											status: 'ok'
										});
									}
								});
							}
						});
					} else {
						console.log("[DBCalendar] Add: 'Exists'->'" + req.params.uid + "'");
						callback({
							status: 'fail'
						});
					}
				}
			});
		});
	};
	DBCalendar.find = function (req, res, callback) {
		console.log("[DBCalendar] Find: '" + req.params.uid + "'");
		collectionCalendar.findOne({
			_id: req.params.uid
		}, function (err, result) {
			if (err) {
				console.error("[DBCalendar] Find: " + err.message);
				callback({
					status: 'fail'
				});
			} else {
				callback({
					status: 'ok',
					data: result
				});
			}
		});
	};
	DBCalendar.remove = function (req, res, callback) {
		console.log("[DBCalendar] Remove: '" + req.params.uid + "'");
		collectionCalendar.findOne({
			_id: req.params.uid
		}, function (err, result) {
			if (err) {
				console.log("[DBCalendar] Remove: " + err.message);
				callback({
					status: 'fail'
				});
			} else {
				var row = result;
				collectionCalendar.remove({
					_id: req.params.uid
				}, function (err, result) {
					if (err) {
						console.log("[DBCalendar] Remove: " + err.message);
						callback({
							status: 'fail'
						});
					} else {
						MUNSNCal.remove(row, function (err, result) {
							if (err) {
								console.log("[MUNSNCal] Remove: '" + err + "'");
								callback({
									status: 'fail'
								});
							} else {
								callback({
									status: 'ok'
								});
							}
						});
					}
				});
			}
		});
	};
	DBCalendar.insertEvent = function (req, res, callback) {
		googleFuncs.getKey(
			function (key) {
				calendar.events.insert({
						auth: key,
						calendarId: "6rqlb7jaeqrgrd0ov5j73tijkg@group.calendar.google.com",
						resource: {

						}
					},
					function (err, event) {

					}
				);
			}
		);
	};
	DBCalendar.removeACL = function (req, res, callback) {
		collectionCalendar.getOne({
			_id: req.params.uid
		}, function (err, result) {
			if (err) {

			} else {
				MUNSNCal.removeACL({
					calendarid: result.calendarid,
					ruleid: req.params.ruleid
				}, function (err, result) {

				});
			}
		});
	};
};