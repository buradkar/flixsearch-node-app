/**
* Module dependencies.
*/
var express = require('express')
, fs = require('fs')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, Validator = require('validator').Validator
, mongoose = require('mongoose')
;

var env = process.env.NODE_ENV || 'development'
, config = require('./config/config')[env]

mongoose.connect(config.db)

// Bootstrap models
var addModel = function(dir) {
    fs.readdirSync(dir).forEach(function (file) {
        if(fs.lstatSync(dir+'/'+file).isDirectory() == false) {
            require(dir+'/'+file);
        } else {
            addModel(dir+'/'+file);
        }
    });
}
addModel(__dirname + '/app/models');


var app = express();
app.use(express.static(__dirname + '/public'));


// express settings
require('./config/express')(app, config)

// Bootstrap routes
require('./config/routes')(app)

http.createServer(app).listen(app.get('port'), function(){
	app.set('views', __dirname + '/app/views');
	app.set('view engine', 'jade');

    console.log("Express server listening on port " + app.get('port'));
});