var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
/**
 * Extracts the ID from an emailstring
 * @param String email - The string representation of the email
 * @returns String id - Userid
 */
function getIdFromEmail(email) {
    var id = email.substring(0, email.indexOf("@"));
    return id;
};

/**
 * Adds minutes to the date given as 60000ms/min.
 * This is due to the long integer time that all machines use. 
 * @param Date date - The date object given
 * @param Integer mins - The minutes to add
 * @returns Date with added minutes
 */
function addMinsToDate(date, mins) {
    return new Date(date.getTime() + mins*60000);
};

/**
 * Returns a generator of fullpaths of files found.
 * @param String filter - The case sensitive filter to match the file with
 * @param directory - The full path to search
 * @returns file - The Full path of the each file
 */
function* findFiles(filter,directory) {
	if(!fs.existsSync(directory)) {
		console.log("ERR: "+directory+" does not exist");
		return;
	}
	var files = fs.readdirSync(directory);
	for (var i = 0; i < files.length; ++i) {
		var filename = path.join(directory,files[i]);
		var stat = fs.lstatSync(filename);
		if(!stat.isDirectory() && filename.indexOf(filter) >= 0) {
			yield filename;
		}
	}
};
/**
 * Pipes a file back to the GET Http request <br>
 * @param HTTPRequest req - the request to receive this file (UNUSED)
 * @param HTTPResponse res - the response to send this file through
 * @param String file - the full path of the file. <br>
 * @returns void
 */
function download(req, res, file){
	fs.exists(file,	function(exist){
		if(exist){
			var filename = path.basename(file);
			var mimetype = mime.lookup(file);
			res.setHeader('Content-disposition','attachment; filename=',filename);
			res.setHeader('Content-type',mimetype);			
			var fstream = fs.createReadStream(file);
			fstream.pipe(res);
		} else {
			res.status(404).send('Content not found');
		}
	});
};

/**
 * Receives a file from the POST http request
 * @param HTTPRequest req - The request this file comes from
 * @param String name - The name to give this file when saving it
 * @param String dest - The relative path to 'content/images/%dest%'
 * @returns void
 */
function uploadImage(req, name, dest){
	var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
    	var dir = path.join(__dirname, '../content/images/' + dest + '/');
    	var fext = path.extname(filename);
        console.log("Uploading: " + filename);
        //Path where image will be uploaded
        fs.exists(dir,function(exist){
        	if(!exist)
        		fs.mkdirSync(dir);
        	else
        		for (var f of findFiles(name, dir)){
        			if (f !== undefined)
        				fs.unlinkSync(f);
        		}        		
        	//fstream = fs.createWriteStream(path.join(dir,filename));
        	//gm(file,filename).write(fstream,function(err) {if (err) throw err;});
            fstream = fs.createWriteStream(path.join(dir, name + fext));
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Uploaded: " + filename); 
            });
        });
    });
};
// Exports
exports.getIdFromEmail = getIdFromEmail;
exports.addMinsToDate = addMinsToDate;
exports.findFiles = findFiles;
exports.download = download;
exports.uploadImage = uploadImage;