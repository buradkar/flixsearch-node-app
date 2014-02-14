var mongoose = require('mongoose')
, moment = require('moment')
, qs = require('qs')
, _ = require('underscore')
, Catalog = mongoose.model('Catalog')
, Tag = mongoose.model('Tag')
, GenreStat = mongoose.model('GenreStat')
;


var saveTag = function(searchParam) {
    console.log("Saving Tags........")
    var query = GenreStat.find().sort({"_id.name":1})   
    query.execFind(function (err, genres) {
        if (!err) {
            _.each(genres, function(genre, i){
                var tag = new Tag();
                tag.name = genre._id.name;
                tag.searchParam = {
                    genres: [ genre._id.id ],
                    orderBy: 'averageRating'
                };
                if(genre.value >= 300) {
                    tag.rating = 1;
                } else {
                    tag.rating = 0;
                }
                tag.save();
            });
            return "OK";
        } else {
            return console.error(err);
        }
    });

    var tag = new Tag();
    tag.name = "Top 2013 Movies";
    tag.searchParam = { 
        releaseYears: [ '2013']
    };
    tag.rating = 2;
    tag.save();


    tag = new Tag();
    tag.name = "Top 2013-2012 Comedies";
    tag.searchParam = { 
        genres: [ '6548' ],
        releaseYears: [ '2013', '2012' ]
    };
    tag.rating = 2;
    tag.save();

    tag = new Tag();
    tag.name = "Expiring Soon";
    tag.searchParam = { 
        showExpiringSoon: true
    };
    tag.rating = 2;
    tag.save();
}

// curl http://localhost:3000/tag/get
exports.get = function(req, res) {
    // saveTag();
	res.setHeader('Content-Type', 'application/json');
	var query = Tag.find().sort({"rating":-1, "name":1})   
    return query.execFind(function (err, tags) {
        if (!err) {
            return res.send(tags);
        } else {
            return console.error(err);
        }
    });
}