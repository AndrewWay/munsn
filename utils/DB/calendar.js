var fs = require('fs');
var path = require('path');
var googleFuncs = require('../googleFuncs');
var googleapi = require('googleapis');
var calendar = googleapi.calendar('v3');
var console = require('../consoleLogger');
var MUNSNCal = {};
MUNSNCal.add = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.calendars.insert({
			auth: key,
			resource: {
				summary: data.uid
			}
		}, function (err1, result1) {
			var acl = {
				calendarId: result1.id,
				role: 'writer',
				type: 'user',
				value: data.uid + '@mun.ca'
			};
			MUNSNCal.addACL({
				calendarId: acl.calendarId
			}, function (err2, result2) {
				MUNSNCal.addACL(acl, function (err3, result3) {
					callback(err1, result1);
				});
			});
		});
	});
};
MUNSNCal.get = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.calendars.get({
			auth: key,
			calendarId: data.calendarid
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
			resource: data.resource
		}, callback);
	});
};
MUNSNCal.updateEvent = function (data, callback) {
	googleFuncs.getKey(function (key) {
		calendar.events.update({
			auth: key,
			calendarId: data.calendarid,
			resource: data.resource
		}, callback);
	});
};
MUNSNCal.findEvents = function (data, callback) {
	googleFuncs.getKey(
		function (key) {
			calendar.events.insert({
					auth: key,
					calendarId: result.calendarid,
					resource: evnt
				},
				function (err, result) {
					if (err) {
						console.error("[DBCalendar] InsertEvent", err.message);
						callback({
							status: 'fail'
						});
					} else {
						callback({
							status: 'ok',
							data: result
						});
					}
				}
			);
		}
	);
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

module.exports = function (DBCalendar, collectionCalendar) {
	DBCalendar.add = function (req, res, callback) {
		console.log("[DBCalendar] Add", "'" + req.params.uid + "'");
		googleFuncs.getKey(function (key) {
			collectionCalendar.findOne({
				_id: req.params.uid
			}, function (err, fResult) {
				if (err) {
					console.log("[DBCalendar] Add", err.message);
					callback({
						status: 'fail'
					});
				} else {
					if (!fResult) {
						MUNSNCal.add({
							uid: req.params.uid
						}, function (err, aResult) {
							if (err) {
								console.log("[DBCalendar] Add", "'" + err.message + "'");
								callback({
									status: 'fail'
								});
							} else {
								collectionCalendar.insert({
									_id: req.params.uid,
									calendarid: aResult.id,
									events: []
								}, function (err, iResult) {
									if (err) {
										console.log("[DBCalendar] Add", "'" + JSON.stringify(err) + "'");
										callback({
											status: 'err'
										});
									} else {
										console.log("[DBCalendar] Add", "'{uid:'" + req.params.uid + "', data:'" + JSON.stringify(aResult) + "'}'->'" + JSON.stringify(iResult) + "'");
										callback({
											data: aResult,
											status: 'ok'
										});
									}
								});
							}
						});
					} else {
						console.log("[DBCalendar] Add", "'Exists'->'" + req.params.uid + "'");
						callback({
							status: 'fail'
						});
					}
				}
			});
		});
	};
	DBCalendar.get = function (req, res, callback) {
		console.log("[DBCalendar] Find", "'" + req.params.uid + "'");
		collectionCalendar.findOne({
			_id: req.params.uid
		}, function (err, fResult) {
			var row = fResult;
			if (err) {
				console.error("[DBCalendar] Get", err.message);
				callback({
					status: 'fail'
				});
			} else {
				if (!row) {
					console.warn("[DBCalendar] Get", "'NotExist'->'" + req.params.uid + "'");
					callback({
						status: 'fail'
					});
				} else {
					MUNSNCal.get(row, function (err, gResult) {
						if (err) {
							console.error("[DBCalendar] Get", "'" + err + "'");
							callback({
								status: 'fail'
							});
						} else {
							callback({
								status: 'ok',
								data: gResult
							});
						}
					});
				}
			}
		});
	};
	DBCalendar.remove = function (req, res, callback) {
		console.log("[DBCalendar] Remove", "'" + req.params.uid + "'");
		collectionCalendar.findOne({
			_id: req.params.uid
		}, function (err, fResult) {
			if (err) {
				console.log("[DBCalendar] Remove", err.message);
				callback({
					status: 'fail'
				});
			} else {
				var row = fResult;
				collectionCalendar.remove({
					_id: req.params.uid
				}, function (err, rResult) {
					if (err) {
						console.log("[DBCalendar] Remove", err.message);
						callback({
							status: 'fail'
						});
					} else {
						if (!fResult) {
							console.warn("[DBCalendar] Remove", "'NotExist'->'" + req.params.uid + "'");
							callback({
								status: 'fail'
							});
						} else {
							MUNSNCal.remove(row, function (err, result) {
								if (err) {
									console.log("[MUNSNCal] Remove", "'" + err + "'");
									callback({
										status: 'fail',
										data: result
									});
								} else {
									callback({
										status: 'ok',
										data: result
									});
								}
							});
						}
					}
				});
			}
		});
	};
	DBCalendar.insertEvent = function (req, res, callback) {
		var evnt = {
			start: req.body.start,
			end: req.body.end,
			recurrence: req.body.recurrence,
			summary: req.body.summary,
			description: req.body.description
		};
		console.log("[DBCalendar] InsertEvent", "'" + JSON.stringify(evnt) + "'->'" + req.params.uid + "'");
		collectionCalendar.findOne({
			_id: req.params.uid
		}, function (err, result) {
			if (err) {
				console.error("[DBCalendar] InsertEvent", err.message);
				callback({
					status: 'fail'
				});
			} else {
				var data = {
					calendarid: result.calendarid,
					resource: evnt
				};
				MUNSNCal.addEvent(data, function (err, result) {
					if (err) {
						console.log("[DBCalendar] InsertEvent", err.message);
						callback({
							status: 'fail',
							data: result
						});
					} else {
						console.log("[DBCalendar] InsertEvent", "'" + JSON.stringify(result) + "'->'" + "'{uid:'" + req.params.uid + "', calendarId:'" + data.calendarid + "'}'");
						callback({
							status: 'ok',
							data: result
						});
					}
				});
			}
		});
	};
};