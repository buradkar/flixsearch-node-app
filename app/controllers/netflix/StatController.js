var mongoose = require('mongoose')
, moment = require('moment')
, qs = require('qs')
, _ = require('underscore')
, Catalog = mongoose.model('Catalog')
, GenreStat = mongoose.model('GenreStat')
, ReleaseYearStat = mongoose.model('ReleaseYearStat')
, AverageRatingStat = mongoose.model('AverageRatingStat')
;

var generateGenreStats = function() {
	var o = {};
	o.map = function () { 
		if(this.category === "movies") {
		    for (var i in this.genres) { 
		        emit({id:this.genres[i].genreId, name:this.genres[i].name}, 1);
		    }
		}
	}

	o.reduce = function (k, vals) { 
		var count = 0;
		for (v in vals) { 
			count += vals[v];
		}
		return count;
	};
	o.out = { replace: 'catalogs.genrestats' };

	Catalog.mapReduce(o, function (err, results) {
	  	console.log(results);
	  	console.log(results.length);
	})
}

var generateReleaseYearStats = function() {
	var o = {};
	o.map = function () {
		if(this.category === "movies") {
        	emit({year:this.releaseYear}, 1);
        }
	}

	o.reduce = function (k, vals) { 
		var count = 0;
		for (v in vals) { 
			count += vals[v];
		}
		return count;
	};
	o.out = { replace: 'catalogs.releaseyearstats' };

	Catalog.mapReduce(o, function (err, results) {
	  	console.log(results);
	  	console.log(results.length);
	})
}

var generateAverageRatingStats = function() {
	var o = {};
	o.map = function () {
		if(this.category === "movies") {
        	emit({rating:this.averageRating}, 1);
        }
	}

	o.reduce = function (k, vals) { 
		var count = 0;
		for (v in vals) { 
			count += vals[v];
		}
		return count;
	};
	o.out = { replace: 'catalogs.averageratingstats' };

	Catalog.mapReduce(o, function (err, results) {
	  	console.log(results);
	  	console.log(results.length);
	})
}

// curl  -X POST http://localhost:3000/stat/generate
exports.generate = function(req, res) {
	generateGenreStats();
	generateReleaseYearStats();
	generateAverageRatingStats();
    return res.send("OK");
}

exports.get = function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var data = {};
	var checkIfAllComplete = function(inData) {
		if(_.isUndefined(inData.genres) === false && _.isUndefined(inData.averageRatings) === false && _.isUndefined(inData.releaseYears) === false) {
			return res.send(inData);
		}
	};
	getAllGenres(data, checkIfAllComplete);
	getAllReleaseYears(data, checkIfAllComplete);
	getAllAverageRating(data, checkIfAllComplete);
}

var getAllGenres = function(data, callback) {
	var query = GenreStat.find().sort({"_id.name":1});
    return query.execFind(function (err, genres) {
        if (!err) {
        	var genreArray = new Array();
        	_.each(genres, function(genre, i){
        		genreArray.push({"id": genre._id.id, "name": genre._id.name, "count": genre.value});
        	});
        	data.genres = genreArray;

            if(_.isUndefined(callback) === false) {
				return callback(data);
			} else {
				return data;
			}
        } else {
            return console.error(err);
        }
    });
}

var getAllReleaseYears = function(data, callback) {
	var query = ReleaseYearStat.find().sort({"_id.year":-1});
    return query.execFind(function (err, releaseYears) {
		if (!err) {
			var releaseYearArray = new Array();
        	_.each(releaseYears, function(releaseYear, i){
        		releaseYearArray.push({"id":releaseYear._id.year, "name": releaseYear._id.year, "count": releaseYear.value});
        	});

			data.releaseYears = releaseYearArray;

			if(_.isUndefined(callback) === false) {
				return callback(data);
			} else {
				return data;
			}
		} else {
			return console.error(err);
		}
	});
}

var getAllAverageRating = function(data, callback) {
	var query = AverageRatingStat.find().sort({"_id.rating":-1});
    return query.execFind(function (err, averageRatings) {
		if (!err) {
			var averageRatingArray = new Array();
			var rating4To5 = 0;
			var rating3To4 = 0;
			var rating2To3 = 0;
			var rating1To2 = 0;
			var rating0To1 = 0;

        	_.each(averageRatings, function(averageRating, i){
        		var rating = parseFloat(averageRating._id.rating);
				if(_.isNull(averageRating._id.rating) || _.isUndefined(averageRating._id.rating) || rating <= 1) {
					rating0To1+=averageRating.value;
				} else if(rating > 1 && rating <= 2) {
					rating1To2+=averageRating.value;
				} else if(rating > 2 && rating <= 3) {
					rating2To3+=averageRating.value;
				} else if(rating > 3 && rating <= 4) {
					rating3To4+=averageRating.value;
				} else if(rating > 4 && rating <= 5) {
					rating4To5+=averageRating.value;
				}
        	});
        	averageRatingArray.push({"id":4 , "name": "4 - 4.9", "count": rating4To5});
        	averageRatingArray.push({"id":3 , "name": "3 - 3.9", "count": rating3To4});
        	averageRatingArray.push({"id":2 , "name": "2 - 2.9", "count": rating2To3});
        	averageRatingArray.push({"id":1 , "name": "1 - 1.9", "count": rating1To2});
        	averageRatingArray.push({"id":0 , "name": "N/A - 0.9", "count": rating0To1});

			data.averageRatings = averageRatingArray;

			if(_.isUndefined(callback) === false) {
				return callback(data);
			} else {
				return data;
			}
		} else {
			return console.error(err);
		}
	});
}