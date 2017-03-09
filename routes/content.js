var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var gm = require('gm');
/* GET upload page. */
router.get('/image/profile/:uid', function(req, res, next) {
	var file = findFile('profile',path.join(__dirname, '../content/images/user/'+req.params.uid));
	download(req,res,file);
});
router.get('/image/group/:gid', function(req, res, next) {
	var file = path.join(__dirname, '../content/images/user/'+req.params.uid+'/profile.jpg');
	download(req,res,file);
});

router.post('/image/user/:uid', function(req, res, next) {
	uploadImage(req, 'profile', 'user/'+req.params.uid);
    res.redirect('back');           
});
router.post('/image/group/:gid', function(req, res, next) {
	uploadImage(req, 'group/'+req.params.gid);
    res.redirect('back');   
});
router.post('/image/post/:pid', function(req, res, next) {
	uploadImage(req, 'posts/'+req.params.pid);
    res.redirect('back');   
});
function findFile(filter,directory) {
	if(!fs.existsSync(directory)) {
		console.log("ERR: "+directory+" does not exist");
		return;
	}
	var files = fs.readdirSync(directory);
	for (var i = 0; i < files.length; ++i) {
		var filename = path.join(directory,files[i]);
		console.log(filename);
		var stat = fs.lstatSync(filename);
		if(!stat.isDirectory() && filename.indexOf(filter) >= 0) {
			return filename;
		}
	}
	return undefined;
}
function download(req,res, file){
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
}
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
        	var fileExist = findFile(name, dir);
        	if (fileExist !== undefined)
        		fs.unlinkSync(fileExist);
        	//fstream = fs.createWriteStream(path.join(dir,filename));
        	//gm(file,filename).write(fstream,function(err) {if (err) throw err;});
            fstream = fs.createWriteStream(path.join(dir, name + fext));
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Uploaded: " + filename); 
            });
        });
    });
}

module.exports = router;
