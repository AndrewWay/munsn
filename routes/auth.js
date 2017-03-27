var express = require("express");
var router = express.Router();
var utils = require("../utils/utils");
var aks = require("../utils/aks");
var console = require("../utils/consoleLogger");
router.get("/", function (req, res, next) {
	//TODO: Kyle, I know you won't see this but, It would be nice to know how you want to do this, I have set it up so that
	//It automatically logs you in when you authenticate. I can send this shit back or redirect here, but I can't do both apparently.
	//So, Its up to you how you want to do this.
	console.log("[ROUTER] Auth", "'Validate'->'" + req.query.key + "'");
	if (req.query.key) {
		aks.validate(req, res, function (success, result) {
			if (success) {
				//res.redirect('/');
				res.json(result);
			} else {
				// TODO: FILL THESE WITH THE APPROPRIATE FRONTEND DATA
				res.json(result);
				//res.render('error');
			}
		});
	} else {
		res.json({
			status: 'fail'
		});
	}
});

module.exports = router;