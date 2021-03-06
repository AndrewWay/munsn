exports.UserID = function (req, res, next) {
	if (req.params) {
		switch (req.params.uid) {
			case 'session':
				req.UserID = (req.session.user ? req.session.user._id : undefined);
				break;
			default:
				req.UserID = req.params.uid;
				break;
		}
	}
	next();
};