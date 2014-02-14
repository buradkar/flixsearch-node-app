var express = require('express')
   , path = require('path')

module.exports = function(app, config) {
    app.configure(function(){
      app.set('port', process.env.PORT || 2000);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'jade');
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser('your secret here'));
      app.use(express.session());
      app.use(app.router);
      app.use(express.static(path.join(__dirname, 'public')));
    });

    app.configure('development', function(){
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
      app.locals.pretty = true;
    });

    app.configure('production', function(){
      // app.use(express.errorHandler());
      app.use(function(err, req, res, next){
        res.send(500, { error: 'Sorry something bad happened!' });
      });
      app.locals.pretty = true;
    });
}
