var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');
/* GET upload page. */
router.get('/', function(req, res, next) {
	res.render('upload', {
		title : 'Uploader'
	});
});

router.post('/user', function(req, res, next) {
	var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        fstream = fs.createWriteStream(path.join(__dirname,'../content/upload/' + filename));
        file.pipe(fstream);
        fstream.on('close', function () {    
            console.log("Upload Finished of " + filename);              
            res.redirect('back');           //where to go next
        });
    });
});

module.exports = router;
