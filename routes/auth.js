var express = require("express");
var router = express.Router();
var utils = require("../utils/utils");
var aks = require("../utils/aks");
router.get("/", function (req, res, next) {
	console.log("[ROUTER] Auth: 'Validate'->'" + req.query.key + "'");
	if (req.query.key) {
		aks.validate(req, res, function (success, result) {
			if (success) {
				res.json(result);
			} else {
				// TODO: FILL THESE WITH THE APPROPRIATE FRONTEND DATA
				res.json(result);
			}
		});
	} else {
		res.json({
			status: 'fail'
		});
	}
});

module.exports = router;