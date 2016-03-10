
// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var relationship = require("mongoose-relationship");

// define the schema for our user model
var userSchema = new mongoose.Schema({

  // Mandatory fields  
	username     : { type : String, required : true, trim : true, lowercase : true },	
	email        : { type : String, required : true, unique : true, lowercase : true },
  mobileNumber : { type : Number, required : true, trim : true, min:10},
	password     : { type : String, required : false, min: 6},
 

  //Verify user 
  isVerified : { type : Boolean, required : false, default : false },

  // Additional fields
  socialId      : { type : String, required : false, default : null },
  profilePicUrl : { type : String, required : false, default : null },  

  //Required fields for Push Notification
  gcmId             : { type : String, required : false, trim : true, default : null },
  deviceType        : { type : String, required : false, trim : true, lowercase : true },
  registeredThrough : { type : String, required : false, trim : true, lowercase : true },

  //Timestamps
  createdAt    : { type : Date, default : Date.now },
  updatedAt    : { type : Date, default : Date.now },
  lastLoggedIn : { type : String, default : Date.now },
  lastLoggedOut : { type : String, default : null },


});

/**
 * Password hash middleware.
 */
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


/**
 * Helper method for validating user's password.
 */
 userSchema.methods.validPassword = function(password, callback) {
     bcrypt.compare(password, this.password, function(err, isMatch) {
        if(err)
        {
          return callback(err);
        }
          callback(null, isMatch)
      })
};

/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
 userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v
  return obj;
}



module.exports = mongoose.model('User', userSchema);
