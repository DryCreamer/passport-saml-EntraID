const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const errorhandler = require('errorhandler');

var env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];

console.log('Using configuration', config);

require('./config/passport')(passport, config);

var app = express();

app.set('port', config.app.port);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(
  {
    resave: true,
    saveUninitialized: true,
    secret: 'this shit hits'
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

require('./config/routes')(app, config, passport);

// create the HTTPS server
//the following lines replace the original app.listen call
//this allows the use of https and fs
//the fs allows nodeJS to use the file system to grab the .pfx or pem files
const server = https.createServer({
  pfx: fs.readFileSync('./localhost.pfx'), //use these lines to read .pfx files - comment out if using .pem
  passphrase: 'password', //use these lines to read .pfx files
  // key: fs.readFileSync('private-key.pem'),  //uncomment these 2 lines to use .pem cert and key files
  // cert: fs.readFileSync('certificate.pem'),
}, app) // this line has the 'app' the original example used down below to listen

//we are gonna use the 'app' we wrapped in https and call it here to listen
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));

// the orginal app.listen from passport-saml
//app.listen(app.get('port'), function () {
  //console.log('Express server listening on port ' + app.get('port'));
});
