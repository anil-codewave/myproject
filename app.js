
  /**
   * Module dependencies.
   */
  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var moment     = require('moment');
  var compression = require('compression');
  var winston = require('winston');
  var mongoose = require('mongoose');
  var port = process.env.PORT || 8080;
  var expressValidator = require('express-validator');

  var app = express();

  var server = require('http').createServer(app);

  // view engine setup ====================================================================
    app.set('views', path.join(__dirname, 'views'));

  // Template engine ======================================================================
    app.set('view engine', 'ejs'); // set up ejs for templating
    app.set('view cache', true);

    app.use(logger('dev'));
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressValidator());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

  // load required configured & property files ==============================================
    var configDB = require('./config/database.js');
    var propertiesFile = require('./config/properties.js');

  // MongDB Configuration ===================================================================
    mongoose.connect(configDB.db); // connect to our database    
    
  // Global variables declaration ===========================================================
  
    global.jwtTokenSecret = propertiesFile.secret; // Json web token secret key

    global.baseUrl = propertiesFile.baseUrl;  //base url 

  // ***************************************************************************************** 

  // Required models ========================================================================
    var user    = require('./models/user');


  // Required controllers ===================================================================
    var userController = require('./controllers/user');
  
  //===================================ROUTES================================================
  /**
   * Index.
   */
   app.get('/', function(req, res) {
        res.render('index.ejs');
      });

   /**
   * User routes. 
   */
   // Without Authentication
   app.post('/postSignup', userController.postSignup);
   app.post('/postSocialUserSignup', userController.postSocialUserSignup);
   app.post('/postLogin', userController.postLogin);
   app.get('/forgotPassword/:email', userController.forgotPassword);

   //With JWT Token Authentication
   app.get('/api/v1/deleteUser', userController.deleteUser);
   app.get('/api/v1/getUserDetails/:userId', userController.getUserDetails);

   // Get List Of All Users -- list all -- get by id-- delete by id
   app.get('/api/v1/getListOfAllUsers', userController.getListOfAllUsers);
   app.get('/api/v1/getListOfAllUsers/:userId', userController.getListOfAllUsers);
   app.get('/api/v1/getListOfAllUsers/destroy/:id', userController.getListOfAllUsers);


  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  //CORS (Access-Control-Allow-Origin)  
    app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);

      // Pass to next layer of middleware
      next();
    });

  // run the server 
  server.listen(port, function () {
        console.log('Server listening at port %d ', port);
      });


  module.exports = app;




