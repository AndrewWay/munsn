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
				callback(err1, result1);
				MUNSNCal.addACL(acl, function (err3, result3) {});
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
MUNSNCal.getEvents = function (data, callback) {
	googleFuncs.getKey(
		function (key) {
			calendar.events.list({
				auth: key,
				calendarId: data.calendarid
			}, callback);
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
		console.log("[DBCalendar] Add", "'" + req.UserID + "'");
		googleFuncs.getKey(function (key) {
			collectionCalendar.findOne({
				_id: req.UserID
			}, function (err, fResult) {
				if (err) {
					console.log("[DBCalendar] Add", err.message);
					callback({
						status: 'fail'
					});
				} else {
					if (!fResult) {
						MUNSNCal.add({
							uid: req.UserID
						}, function (err, aResult) {
							if (err) {
								console.log("[DBCalendar] Add", "'" + err.message + "'");
								callback({
									status: 'fail'
								});
							} else {
								collectionCalendar.insert({
									_id: req.UserID,
									calendarid: aResult.id
								}, function (err, iResult) {
									if (err) {
										console.log("[DBCalendar] Add", "'" + JSON.stringify(err) + "'");
										callback({
											status: 'err'
										});
									} else {
										console.log("[DBCalendar] Add", "'{uid:'" + req.UserID + "', data:'" + JSON.stringify(aResult) + "'}'->'" + JSON.stringify(iResult) + "'");
										callback({
											data: aResult,
											status: 'ok'
										});
									}
								});
							}
						});
					} else {
						console.log("[DBCalendar] Add", "'Exists'->'" + req.UserID + "'");
						callback({
							status: 'fail'
						});
					}
				}
			});
		});
	};
	DBCalendar.get = function (req, res, callback) {
		console.log("[DBCalendar] Find", "'" + req.UserID + "'");
		collectionCalendar.findOne({
			_id: req.UserID
		}, function (err, fResult) {
			var row = fResult;
			if (err) {
				console.error("[DBCalendar] Get", err.message);
				callback({
					status: 'fail'
				});
			} else {
				if (!row) {
					console.warn("[DBCalendar] Get", "'NotExist'->'" + req.UserID + "'");
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
		console.log("[DBCalendar] Remove", "'" + req.UserID + "'");
		collectionCalendar.findOne({
			_id: req.UserID
		}, function (err, fResult) {
			if (err) {
				console.log("[DBCalendar] Remove", err.message);
				callback({
					status: 'fail'
				});
			} else {
				var row = fResult;
				collectionCalendar.remove({
					_id: req.UserID
				}, function (err, rResult) {
					if (err) {
						console.log("[DBCalendar] Remove", err.message);
						callback({
							status: 'fail'
						});
					} else {
						if (!fResult) {
							console.warn("[DBCalendar] Remove", "'NotExist'->'" + req.UserID + "'");
							callback({
								status: 'fail'
							});
						} else {
							MUNSNCal.remove(row, function (err, gResult) {
								if (err) {
									console.log("[MUNSNCal] Remove", "'" + err + "'");
									callback({
										status: 'fail',
										data: gResult
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
		console.log("[DBCalendar] InsertEvent", "'" + JSON.stringify(evnt) + "'->'" + req.UserID + "'");
		collectionCalendar.findOne({
			_id: req.UserID
		}, function (err, fResult) {
			if (err) {
				console.error("[DBCalendar] InsertEvent", err.message);
				callback({
					status: 'fail'
				});
			} else {
				var data = {
					calendarid: fResult.calendarid,
					resource: evnt
				};
				MUNSNCal.addEvent(data, function (err, gResult) {
					if (err) {
						console.log("[DBCalendar] InsertEvent", err.message);
						callback({
							status: 'fail',
							data: gResult
						});
					} else {
						console.log("[DBCalendar] InsertEvent", "'" + JSON.stringify(gResult) + "'->'" + "'{uid:'" + req.UserID + "', calendarId:'" + data.calendarid + "'}'");
						callback({
							status: 'ok',
							data: gResult
						});
					}
				});
			}
		});
	};
	DBCalendar.getEvents = function (req, res, callback) {
		console.log("[DBCalendar] GetEvents", "'" + req.UserID + "'");
		collectionCalendar.findOne({
			_id: req.UserID
		}, function (err, fResult) {
			var row = fResult;
			if (err) {
				console.error("[DBCalendar] GetEvents", err.message);
				callback({
					status: 'fail'
				});
			} else {
				if (!row) {
					console.warn("[DBCalendar] GetEvents", "'NotExist'->'" + req.UserID + "'");
					callback({
						status: 'fail'
					});
				} else {
					MUNSNCal.getEvents(row, function (err, gResult) {
						if (err) {
							console.error("[DBCalendar] GetEvents", err);
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
};