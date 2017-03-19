var fs = require('fs');
var path = require('path');
var googleFuncs = require('./googleFuncs');
var googleapi = require('googleapis');
var calendar = {};


calendar.find = function (req, res, callback) {
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
};
calendar.insert = function (req, res, callback) {
	googleFuncs.getKey(
		function (key) {
			googleapi.calendar('v3').events.insert({
				auth: key,
				calendarId: "6rqlb7jaeqrgrd0ov5j73tijkg@group.calendar.google.com",
				event: {}
			},
				function (err, event) {

				}
			);
		}
	);
};
/* Test Code
var calendar = require('./utils/calendar');
calendar.list({
	params: {
		uid: 'g1xb17@gmail.com'
	}
}, {}, function (item) {
	console.log(item);
});
*/
module.exports = calendar;