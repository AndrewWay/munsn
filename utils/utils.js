var fs = require("fs-extra");
var path = require("path");
var mime = require("mime");
var imagemin = require("imagemin");
var imageminMozjpeg = require("imagemin-mozjpeg");
var imageminPngquant = require("imagemin-pngquant");
var console = require("./consoleLogger");
/**
 * Extracts the ID from an emailstring
 * @param {string} email - The string representation of the email
 * @returns {string} - Userid
 */
function EmailToID(email) {
	return email.substring(0, email.indexOf("@"));
}

/**
 * Adds minutes to the date given as 60000ms/min.
 * This is due to the long integer time that all machines use.
 * @param {Date} date - The date object given
 * @param {number} mins - The minutes to add
 * @returns {Date} with added minutes
 */
function addMinsToDate(date, mins) {
	return new Date(date.getTime() + mins * 60000);
}

/**
 * Returns a generator of fullpaths of files found.
 * @param {string} filter - The case sensitive filter to match the file with
 * @param {string} directory - The full path to search
 */
function* findFiles(filter, directory) {
	console.log("[Utils] FindFiles", "'" + filter + "'->'" + directory + "'");
	if (!fs.existsSync(directory)) {
		console.warn("[Utils] FindFiles", "'NotExist'->'" + directory + "'");
		return;
	}
	var files = fs.readdirSync(directory);
	for (var i = 0; i < files.length; ++i) {
		var filename = path.join(directory, files[i]);
		var stat = fs.lstatSync(filename);
		if (!stat.isDirectory() && filename.indexOf(filter) >= 0) {
			console.log("[Utils] FindFiles", "'Found'->'" + files[i] + "'");
			yield filename;
		}
	}
}

/**
 *
 * @param {HTTPRequest} req
 * @param {HTTPResponse} res
 * @param {string} file
 */
function remove(filter, directory, callback) {
	var file = findFiles(filter, directory).next().value;
	console.log("[Content] Remove", "'" + filter + "'->'" + directory + "'");
	if (file) {
		fs.unlinkSync(file);
		callback({
			status: 'ok'
		});
		console.log("[Content] Remove", "'Deleted'->'" + file + "'");
	} else {
		console.error("[Content] Remove", "'Fail'->'" + file + "'");
		callback({
			status: 'fail'
		});
	}
}
/**
 * Pipes a file back to the GET Http request
 * @param {HTTPRequest} req - the request to receive this file (UNUSED)
 * @param {HTTPResponse} res - the response to send this file through
 * @param {string} file - the full path of the file.
 * @returns {void}
 */
function download(req, res, file, callback) {
	//TODO: John, Test this
	console.log("[Content] Download", "'Requested'->'" + file + "'");
	fs.exists(file, function (exist) {
		if (exist) {
			var filename = path.basename(file);
			var mimetype = mime.lookup(file);
			res.setHeader("Content-disposition", "attachment; filename=", filename);
			res.setHeader("Content-type", mimetype);
			var fstream = fs.createReadStream(file);
			fstream.pipe(res);
			fstream.on('finish', function () {
				console.log("[Content] Download", "'Success'->'" + file + "'");
				callback({
					status: 'ok'
				});
			});
		} else {
			console.log("[Content] Download", "'Fail'->'" + file + "'");
			callback({
				status: 'fail'
			});
		}
	});
}

/**
 * Receives a generic file from the POST http request
 * @param {HTTPRequest} req - The request this file comes from
 * @param {String} dest - The relative path to 'content/images/%dest%'
 * @param {String} name - The name to give this file when saving it (optional)
 * @returns {void}
 */
function upload(req, dest, name, callback) {
	//TODO: John, Test this to break it
	try {
		req.pipe(req.busboy);
		req.busboy.on("file", function (fieldname, file, filename) {
			console.log("[Content] Upload", filename);
			var fstream;
			var dir = path.join(__dirname, "../content/" + dest);
			//File extension
			var fext = path.extname(filename);
			//Path where file will be uploaded
			fs.exists(dir, function (exist) {
				//If upload(req,dest) then change set name to filename
				//Create the directory if it doesn't exist
				if (!exist) {
					fs.mkdirsSync(dir);
				} else {
					//If it does exist, find files by the name given and delete them
					for (var f of findFiles(name ? name : filename, dir)) {
						if (f !== undefined) {
							fs.unlinkSync(f);
						}
					}
				}
				if (!name) {
					name = filename;
				} else {
					name = name + fext;
				}
				fstream = fs.createWriteStream(path.join(dir, name));
				fstream.on("close", function () {
					console.log("[Content] Upload->Close", "'" + filename + "'->'" + name + "'");
					callback({
						status: 'fail'
					});
				});
				fstream.on('error', function (err) {
					console.error("[Content] Upload->Error", err);
					req.unpipe(req.busboy);
					callback({
						status: 'fail'
					});
				});
				switch (fext.toLowerCase()) {
					case ".jpg":
					case ".png":
						//I have no idea how to make these images work with imagemin.
						//There's literally no usage guide that makes sense to me
						//The API for all this stuff is teeeeerrrrible
					default:
						console.log("[Content] Upload", "'Writing'->'" + name + "'");
						file.pipe(fstream);
						break;
				}
			});
		});
		req.busboy.on('error', function () {
			console.error("[Content] Upload->Error", "'Error'->'busboy'");
			req.unpipe(req.busboy);
		});
	} catch (err) {
		console.error("[Content] Upload->Error ", "'Error'->'generic'");
		callback({
			status: 'fail'
		});
	}

}

/**
 * Image upload method
 * @param {*} req - The request this file comes from
 * @param {string} dest - The relative path to 'content/%dest%'
 * @param {string} name - The name to rename this file to; can be optionally left undefined
 */
function uploadImage(req, dest, name, callback) {
	upload(req, "images/" + dest, name, callback);
}

/**
 *
 * Helper function that debugs an object's properties and values
 * @param {any} obj - The object to debug
 * @param {any} name - (optional) The name of the object to pass. Just makes the console look better
 */
function debugObject(obj, name) {
	Object.keys(obj).forEach(function (key, index) {
		// key: the name of the object key
		// index: the ordinal position of the key within the object
		console.log("[DEBUG OBJECT]", "'" + name + "'->'" + key + "':'" + obj[key] + "'");
	});
}

// Exports
exports.EmailToID = EmailToID;
exports.addMinsToDate = addMinsToDate;
exports.findFiles = findFiles;
exports.download = download;
exports.uploadImage = uploadImage;
exports.upload = upload;
exports.debugObject = debugObject;