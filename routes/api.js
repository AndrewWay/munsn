var express = require('express');
var router = express.Router();
var db = require('../utils/db');

/*
    GET one user based on id
*/
router.get('/users', function(req, res, next) {
    if (req.query.id !== undefined) {
        res.json(db.findUser(id));
    }
    else {
        res.json({error: "failed"});
    }
});

module.exports = router;