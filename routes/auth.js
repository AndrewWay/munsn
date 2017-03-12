var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var aks = require('../utils/aks');
router.get('/', function (req, res, next) {
    if (req.query.key == undefined) {
        res.json({error: "null or undefined"});
    } else {
        console.log(req.query.key);
        aks.validate(req.query.key, function (success,authResult) {
            if (success){
                res.redirect('/');
            } else {
                // TODO: FILL THESE WITH THE APPROPRIATE FRONTEND DATA
                if (authResult) {
                    //email was resent
                }  else {
                    //This key doesn't exist
                }
            }
        });
    }
});

module.exports = router;