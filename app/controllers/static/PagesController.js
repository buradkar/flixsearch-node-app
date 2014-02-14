var moment = require('moment')
, _ = require('underscore')
;

exports.about = function(req, res) {
    res.render('static/about', { title: 'Netflix Instant Catalog Search'});
}

exports.faq = function(req, res) {
    res.render('static/faq', { title: 'Netflix Instant Catalog Search'});
}