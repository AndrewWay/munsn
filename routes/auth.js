var express = require('express');
var router = express.Router();
var db = require('../utils/db');

router.get('/', function(req, res, next) {
    if (req.query.key == undefined) {
        res.json({error: "undefined"});
    }
    else if (req.query.key == null) {
        res.json({error: "null"});
    }
    else {
        var userKey = {authkey: req.body.key};
        db.checkAuthKey(userKey, function(result) {
            if (result) {
                var id = result.userKey;
                console.log("/AUTH: Found authkey for " + req.query.key);
                db.deleteAuthKey(userKey, function(result) {
                    console.log(result);
                    db.updateUser(id, {auth: true}, function(result) {
                        console.log("/AUTH: Updated user with result: " + result.toJSON());
                    });
                });
            }
            else {
                console.log("/AUTH: Could not find authkey for " + req.query.key);
            }
        });
    }
});

module.exports = router;