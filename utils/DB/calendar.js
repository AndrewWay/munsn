var fs = require('fs');
var path = require('path');
var googleFuncs = require('../googleFuncs');
var googleapi = require('googleapis');

module.exports = function (DBCalendar, collectionCalendar) {
	DBCalendar.add = function (req, res, callback) {
		googleFuncs.getKey(function (key) {
			googleapi.calendar('v3').calendars.insert({
				auth: key,
				resource: {
					summary: req.body.uid
				}
			}, function (err, result) {
				if (err) {
					callback({
						status: 'fail'
					});
				} else {
					collectionCalendar.insert({
						_id: req.body.uid,
						calendarid: result.id
					}, function (err, result) {
						if (err) {

						} else {
							callback({
								data: result,
								status: 'ok'
							});
						}
					});
				}
			});
		});
	};
	DBCalendar.find = function (req, res, callback) {
		collectionCalendar.findOne({
			_id: req.params.uid
		}, function (err, result) {
			googleFuncs.getKey(function (key) {
				googleapi.calendar('v3').calendarList.list({
					auth: key
				}, function (err, list) {
					for (var k in list.items) {
						if (list.items[k].summary === req.params.uid) {
							callback(list.items[k]);
						}
					}
				});
			});
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