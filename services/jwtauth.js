/**
 * Module dependencies.
 */
var jwt = require('jwt-simple'),
	moment = require('moment');

// load required property files =======================
var propertiesFile = require('./config/properties.js');

// Required models ====================================
var User = mongoose.model('User');
   
module.exports = function(req, res, next) {
	var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
	
	if (token) {
		try {
			var decoded = jwt.decode(token, propertiesFile.secret);
			// handle token here
			if (decoded.exp <= moment()) {
				return res.json({status_code:500, status:'failure', message:'Access token has expired.'});;
			}
			User.findOne({id: decoded.iss }, function(err, user) {
				if(user) {
					req.user = user;
					next();
				}
				else {
					return res.json({status_code:500, status:'failure', message:'Invalid token.'});
				}
				
			});

		}
		catch (err) {
			res.json({ success: false, message: 'Failed to authenticate token.' }); 
		}
	} 
	else {
		res.json({ success: false, message: 'No Token Provided.' }); 
	}
};