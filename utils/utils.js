var fs = require('fs');
var path = require('path');
var mime = require('mime');
var imagemin = require('image-min');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
/**
 * Extracts the ID from an emailstring
 * @param {string} email - The string representation of the email
 * @returns {string} - Userid
 */
function getIdFromEmail(email) {
	var id = email.substring(0, email.indexOf("@"));
	return id;
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
	if (!fs.existsSync(directory)) {
		console.log("ERR: " + directory + " does not exist");
		return;
	}
	var files = fs.readdirSync(directory);
	for (var i = 0; i < files.length; ++i) {
		var filename = path.join(directory, files[i]);
		var stat = fs.lstatSync(filename);
		if (!stat.isDirectory() && filename.indexOf(filter) >= 0) {
			console.log(filename);
			yield filename;
		}
	}
}
/**
 * Pipes a file back to the GET Http request
 * @param {HTTPRequest} req - the request to receive this file (UNUSED)
 * @param {HTTPResponse} res - the response to send this file through
 * @param {string} file - the full path of the file.
 * @returns {void}
 */
function download(req, res, file) {
	fs.exists(file, function (exist) {
		if (exist) {
			var filename = path.basename(file);
			var mimetype = mime.lookup(file);
			res.setHeader('Content-disposition', 'attachment; filename=', filename);
			res.setHeader('Content-type', mimetype);
			var fstream = fs.createReadStream(file);
			fstream.pipe(res);
		} else {
			res.status(404).send('Content not found');
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
function upload(req, dest, name) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		var dir = path.join(__dirname, '../content/' + dest);

		//File extension
		var fext = path.extname(filename);
		console.log("Uploading: " + filename);
		//Path where file will be uploaded
     	fs.exists(dir, function (exist) {
			//Create the directory if it doesn't exist
			if (!exist)
				fs.mkdirSync(dir);
			else
				//If it does exist, find files by the name given and delete them
				//
				for (var f of findFiles((name ? name : filename), dir)) {
					if (f !== undefined)
						fs.unlinkSync(f);
				}
			//If upload(req,dest) then change set name to filename
			if (!name)
				name = filename;
			else
				name = name + fext;
			fstream = fs.createWriteStream(path.join(dir, name));
			fstream.on('close', function () {
				console.log("Uploaded: " + filename);
			});
			switch (fext.toLowerCase()) {
				case '.jpg':
				case '.png':
					//I have no idea how to make these images work with imagemin.
					//There's literally no usage guide that makes sense to me
					//The API for all this stuff is teeeeerrrrible
				default:
					file.pipe(fstream);
					break;
			}
		});
	});
}

/**
 * Image upload method
 * @param {*} req - The request this file comes from
 * @param {string} dest - The relative path to 'content/%dest%'
 * @param {string} name - The name to rename this file to; can be optionally left undefined
 */
function uploadImage(req, dest, name) {
	upload(req, 'images/' + dest, name);
}
// Exports
exports.getIdFromEmail = getIdFromEmail;
exports.addMinsToDate = addMinsToDate;
exports.findFiles = findFiles;
exports.download = download;
exports.uploadImage = uploadImage;
exports.upload = upload;