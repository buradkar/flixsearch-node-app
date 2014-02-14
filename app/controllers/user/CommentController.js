var mongoose = require('mongoose')
, moment = require('moment')
, _ = require('underscore')
, Comment = mongoose.model('Comment')
;

exports.index = function(req, res) {
    var query = Comment.find().sort({createdAt:-1}).limit(200);
    return query.execFind(function (err, comments) {
        if (!err) {
        	return res.render('user/comment', {model:{comments:comments}});
        } else {
            return console.error(err);
        }
    });
}

exports.add = function(req, res) {
	var comment = new Comment(req.body);
    comment.save(function (err) {
        if (!err) {
            console.log("comment created");
            return res.send(comment);
        } else {
            return console.error(err);
        }
    });
    return res.send(comment);
}

exports.list = function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var query = Comment.find().sort({createdAt:1}).limit(200);
    return query.execFind(function (err, comments) {
        if (!err) {
            return res.send(comments);
        } else {
            return console.error(err);
        }
    });
}