var fs = require('fs');
var path = require('path');
var googleFuncs = require('../googleFuncs');
var googleapi = require('googleapis');

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
						googleapi.calendar('v3').calendars.insert({
							auth: key,
							resource: {
								summary: req.params.uid
							}
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
	DBCalendar.insertEvent = function (req, res, callback) {
		googleFuncs.getKey(
			function (key) {
				googleapi.calendar('v3').events.insert({
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
	DBCalendar.addACL = function (req, res, callback) {
		googleFuncs.getKey(
			function (key) {
				googleapi.calendar('v3').acl.insert({
						auth: key,
						calendarId: "6rqlb7jaeqrgrd0ov5j73tijkg@group.calendar.google.com"
					},
					function (err, acl) {

					}
				);
			}
		);
	};
};