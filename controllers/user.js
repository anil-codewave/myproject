
// load the things we need
var express = require('express');
var mongoose = require('mongoose'); 
var moment = require('moment');
var jwt = require('jwt-simple');

var app = express();

var utility = require('../services/utility.js');

// Required models ====================================
var User = mongoose.model('User');

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = function(req, res, next) {

 // Generic validation
	req.assert('username', 'Username field can not be empty.').notEmpty();
	req.assert('deviceType', 'deviceType field can not be empty.').notEmpty();
	req.assert('registeredThrough', 'registeredThrough field can not be empty.').notEmpty();

 // Email validation
 	req.assert('email', 'Email field is invalid.').isEmail();
  	req.assert('email', 'Email field can not be empty.').notEmpty();

 // Mobile number validation
	req.assert('mobileNumber', 'Mobile Number field can not be empty.').notEmpty();
	req.assert('mobileNumber', 'Mobile Number field Must be 10 digit.').len(10);

 // Password validation
 	req.assert('password', 'password field can not be empty.').notEmpty();
 	req.assert('confirmPassword', 'confirmPassword field can not be empty.').notEmpty();
 	req.assert('password', 'Password must be at least 4 characters long.').len(6);
  	req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

 // GCM ID validation
 	req.assert('gcmId', 'gcmId field can not be empty.').notEmpty();

  	var errors = req.validationErrors();

  	if (errors) {
    	return res.send({status_code:400, status:'failure', message:errors})
  	}

  	// required user inputs  
  	var username = req.body.username;
  	var email 	 = req.body.email;
  	var password = req.body.password;
  	var mobileNumber = req.body.mobileNumber;
  	
  	//required fields for backend process 
  	var gcmId = req.body.gcmId;
  	var deviceType = req.body.deviceType;
  	var registeredThrough = req.body.registeredThrough;

    User.findOne({ email:email  }, function(err, existingUser) 
    {
  		if(err) {
  			return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
  		}
    	if(existingUser) {
    		return res.json({status_code:409 , status:'failure', message:'Account with that email address already exists.'})
   		}
   		else {
   			var newUser = new User();

			newUser.email 	 = email;
			newUser.username = username;
	 		newUser.password = newUser.generateHash(password);
	 		newUser.mobileNumber = mobileNumber;
	 		newUser.gcmId = gcmId;
	 		newUser.deviceType = deviceType;
	 		newUser.registeredThrough = registeredThrough;
	    	newUser.save(function(err, userCreated) {
	      		if (err) {
	       			return res.json({status_code:500, status:'failure', message:'Internal Server Error.', Error: err})
	      		}
	      		else {
	      			return res.json({status_code:201, status:'success', user_info: userCreated})
	      		} 
	    	})
    	}
  	})
}
	
/**
 * POST /login
 */
exports.postLogin =  function(req, res, next)
{
	// Generic validation
	req.assert('deviceType', 'deviceType field  can not be empty.').notEmpty();
	req.assert('registeredThrough', 'registeredThrough field can not be empty.').notEmpty();

	// Email validation
 	req.assert('email', 'Email field is invalid.').isEmail();
  	req.assert('email', 'Email field can not be empty.').notEmpty();

 	// Password validation
 	req.assert('password', 'password field can not be empty.').notEmpty();

 	// GCM ID validation
 	req.assert('gcmId', 'gcmId can not be empty.').notEmpty();

  	var errors = req.validationErrors();

  	if (errors) {
    	return res.send({status_code:400, status:'failure', message:errors})
  	} 

  	//user inputs
	var email = req.body.email;
	var password = req.body.password;
	
	// Required fields for backend process 
  	var gcmId = req.body.gcmId;
  	var deviceType = req.body.deviceType;
  	var registeredThrough = req.body.registeredThrough;
	
	User.findOne({email:email}).populate('comments').exec(function(err, foundUser)
	{
		if(err) {
			return res.json({status_code:500, status:'failure', message:'Internal Server Error.'});
		}
		else {
			if(!foundUser) {
				return res.json({status_code:403 , status:'failure', message:'Unauthorized User, The email you entered don\'t match.'})
			}
			foundUser.validPassword(password, function(err, isMatch)
			{
				if(isMatch) {
					if(foundUser) {
						foundUser.lastLoggedIn = Date.now();
						foundUser.gcmId = gcmId;
				 		foundUser.deviceType = deviceType;
				 		foundUser.registeredThrough = registeredThrough;
						foundUser.save(function(err, UserDetailsUpdated) { 
							if(err) {
								return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
							}
							
							var expires = moment().add(7, 'days').valueOf();
							var token = jwt.encode({
							  iss: foundUser._id,
							  exp: expires
							}, jwtTokenSecret);//global variable 
							
							return res.json({status_code:200, status:'success', token : token,  expires: expires, user_info:UserDetailsUpdated})
						})
					}
				}
				else {
					return res.json({status_code:404 , status:'failure', message:'Unauthorized User, Wrong Password.'})	
				}
			})	
		}
	})
}
/**
 * POST /postSocialUserSignup
 * Create a new social account.
 */
exports.postSocialUserSignup = function(req, res, next) {

 // Generic validation
	req.assert('username', 'Username field can not be empty.').notEmpty();
	req.assert('deviceType', 'deviceType field can not be empty.').notEmpty();
	req.assert('registeredThrough', 'registeredThrough field can not be empty.').notEmpty();

 // Social User ID
 	req.assert('socialId', 'social Id field can not be empty.').notEmpty();

 // Email validation
 	req.assert('email', 'Email field is invalid.').isEmail();
  	req.assert('email', 'Email field field can not be empty.').notEmpty();

 // Mobile number validation
	req.assert('mobileNumber', 'Mobile Number field can not be empty.').notEmpty();
	req.assert('mobileNumber', 'Mobile Number field Must be 10 digit.').len(10);

 // GCM ID validation
 	req.assert('gcmId', 'gcmId field can not be empty.').notEmpty();

	var errors = req.validationErrors(); 

	if (errors) {
  	return res.send({status_code:400, status:'failure', message:errors})
	}

	// required user inputs  
	var username = req.body.username;
	var email 	 = req.body.email;
	var password = req.body.password;
	var mobileNumber = req.body.mobileNumber;
	
	//required fields for backend process 
	var gcmId = req.body.gcmId;
	var deviceType = req.body.deviceType;
	var registeredThrough = req.body.registeredThrough;

 	User.findOne({ email : email }, function(err, existingUser) 
  	{
		if(err) {
			return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
		}
  		if(existingUser) {
	      existingUser.username = username;
	      existingUser.profilePicUrl = profilePicUrl;
	      existingUser.gcmId = gcmId;
	      existingUser.deviceType = deviceType;
	      existingUser.registeredThrough = registeredThrough;
	      existingUser.save(function(err, userDetailsUpdated) {
	        if(err) {
	          return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
	        }
	        else {
	          return res.json({status_code:409 , status:'failure', user_info: userDetailsUpdated, message:'Account with that email address already exists and user details are updated.'})
	        }
	      })
	 	}
	 	else {
	 		var newUser = new User();

			newUser.email 	 = email;
			newUser.username = username;
	 		newUser.mobileNumber = mobileNumber;

	 		newUser.gcmId = gcmId;
	 		newUser.deviceType = deviceType;
	 		newUser.registeredThrough = registeredThrough;
	    	newUser.save(function(err, userCreated) {
	    	  	if (err) {
	       			return res.json({status_code:500, status:'failure', message:'Internal Server Error.', Error: err})
	     		}
	     	 	else {
	        		return res.json({status_code:201, status:'success', user_info: userCreated})
	       	 	} 
	    	})
	  	}
	})
}
/**
 * GET /api/v1/forgotPassword/email
 */
 exports.forgotPassword = function(req, res, next) {
 	var email = req.params.email;
 	console.log(email)
 	utility.sendMail(email);
 	return true;
 	User.findOne({email:email}).exec(function(err, existingUser)
 	{
 		if(err) {
 			return res.json({status_code:500, status:'failure', message:'Internal Server Error.', Error: err})
 		}
 		else {
 			if(existingUser) {
 				
 			}
 			else {
 				return res.json({status_code:409, status:'failure', message:'Invalid User Id.'})
 			}
 		}
 	})
 }
/**
 * GET /api/v1/getUserDetails/userId
 */
exports.getUserDetails = function(req, res, next) {

 // Generic validation
  req.assert('userId', 'userId field can not be empty.').notEmpty();
  
  var errors = req.validationErrors();

  if (errors) {
    return res.json({status_code:500, status:'failure', message:errors })
  }
	var userId = req.params.userId; 
	
	User.findOne({_id:userId}).lean().exec(function(err, userFound) {
		if(err) {
			return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
		}
		else {
			if(userFound) {
				return res.json({status_code:200, status:'success', user_info: userFound})
			}
			else {
				 return res.json({status_code:409, status:'failure', message:'Invalid User Id.'})
			}
		}
	})
}

/**
 * GET /api/v1/listOfAllUsers
 * GET /api/v1/listOfAllUsers/userId
 */
exports.getListOfAllUsers = function(req, res, next) {

	var userId = req.params.userId;
	var destoryUserId = req.params.id;
	if(typeof(userId)!=undefined && userId!=null) {
		User.find({_id:userId}).lean().exec(function(err, usersFound) {
	    	if(err) {
	      	 return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
	    	}
	    	else {
	      		if(typeof(usersFound)!=undefined && (usersFound).length > 0) {
	         		return res.json({status_code:200, status:'success', user_info: usersFound})
	     		 }
	     		else {
	      			return res.json({status_code:404, status:'failure', message:'No users found.'})
	     		}
	    	} 
	  	})
	}
	else if(typeof(destoryUserId)!=undefined && destoryUserId!=null) {
		User.findOne({_id:destoryUserId}).exec(function(err, userFound) {
			if(err) {
				return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
			}
			else {
				if(userFound) {
					userFound.remove(function(err, results)
					{
						if(err) {
							return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
						}
						else {
								return res.json({status_code:200, status:'success'})
						}
					})
				}
				else {
					 return res.json({status_code:409, status:'failure', message:'Invalid User Id.'})
				}
			}
		})
	}
	else {
		User.find({}).lean().exec(function(err, usersFound) {
	    	if(err) {
	      	 return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
	    	}
	    	else {
	      		if(typeof(usersFound)!=undefined && (usersFound).length > 0) {
	         		return res.json({status_code:200, status:'success', user_info: usersFound})
	     		 }
	     		else {
	      			return res.json({status_code:404, status:'failure', message:'No users found.'})
	     		}
	    	} 
	  	})
	}
	
}

/**
 * GET /api/v1/deleteUser/userId
 */
exports.deleteUser = function(req, res, next) {

	// Generic validation
  req.assert('userId', 'userId field can not be empty.').notEmpty();
  
  var errors = req.validationErrors();

  if (errors) {
    return res.json({status_code:500, status:'failure', message:errors })
  }
 
	User.findOne({_id:req.query.userId}).exec(function(err, userFound) {
		if(err) {
			return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
		}
		else {
			if(userFound) {
				userFound.remove(function(err, results)
				{
					if(err) {
						return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
					}
					else {
							return res.json({status_code:200, status:'success'})
					}
				})
			}
			else {
				 return res.json({status_code:409, status:'failure', message:'Invalid User Id.'})
			}
		}
	})
}
	