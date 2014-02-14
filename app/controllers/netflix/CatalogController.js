var mongoose = require('mongoose')
, moment = require('moment')
, qs = require('qs')
, _ = require('underscore')
, Catalog = mongoose.model('Catalog')
, Tag = mongoose.model('Tag')
, GenreStat = mongoose.model('GenreStat')
, CatalogService = require('../../services/netflix/CatalogService')
;

exports.index = function(req, res) {

    res.render('netflix/index', {model:{}});
}

exports.add = function(req, res) {
    var catalog = new Catalog(req.body);
    catalog.save(function (err) {
        if (!err) {
            return console.log("created");
        } else {
            return console.error(err);
        }
    });
    return res.send(catalog);
}

exports.get = function(req, res) {
    var query = {_id: req.query.recordId}
    Catalog.findOne(query, function(err, catalog){
        if (!err) {
            return res.send(catalog);
        } else {
            return console.error(err);
        }
    });
}


exports.search = function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    return getSearchParam(req.body, req.query.tag, function(params) {

        var searchParam = setSearchDefaults(params.searchParam);
        var searchQuery = buildQuery(searchParam);
        var sortCriteria = buildSortCriteria(searchParam);

        var query = Catalog.find(searchQuery).sort(sortCriteria).skip(params.skip).limit(params.pageSize);
        return query.execFind(function (err, catalog) {
            if (!err) {
                return res.send(catalog);
            } else {
                return console.error(err);
            }
        });
    });
};


exports.details = function(req, res) {
    var tagName = req.query.tag;
    var searchParam = {};
    if(_.isNull(req.query.searchQuery) === false && _.isUndefined(req.query.searchQuery) === false) {
        searchParam.keyWords = [req.query.searchQuery];
    }

    return Tag.findOne({"name": tagName}, function (err, tag) {
        if (err == null && tag != null) {
            searchParam = tag.searchParam;
        }
        return res.render('netflix/details', {model:{tagName: tagName, searchParam: searchParam}});
    });
};

//curl http://localhost:3000/netflix/catalogs/deleted
exports.deleted = function(req, res) {
    var query = {
        updatedAt: {$lt: moment().hours(0).minutes(0).seconds(0).format()},
        deletedFromNetflix: false
    };
    return Catalog.find(query, function (err, catalogs) {
        if(!err) {
            _.each(catalogs, function(catalog) {
                catalog.deletedFromNetflix = true;
                catalog.deletedFromNetflixOn = moment().format();
                catalog.save(function(err){
                    if(!err) {
                        console.log("deleted from netfix. Catalog Id: "+ catalog.id);
                    } else {
                        console.error(err);
                    }
                });

            });
            return res.send("Netflix Delete Triggered");
        } else {
            return console.log(err);
        }
    });
};

var getSearchParam = function(searchRequest, tags, callback) {
    var params = {};
    params.pageSize = searchRequest.pageSize || 25;
    params.pageNumber = searchRequest.pageNumber || 1;
    params.skip = (params.pageNumber - 1)*params.pageSize;
    params.searchParam = {};
    params.tagName = tags;
    
    if(_.isUndefined(tags) === false) {
        Tag.findOne({"name": params.tagName}, function (err, tag) {
            if (err == null && tag != null) {
                params.searchParam = tag.searchParam;
                return callback(params);        
            }
        });
    } else {
        params.searchParam = searchRequest;
        return callback(params);
    }
}

var setSearchDefaults = function(params) {
    var checkNullOrUndefined = function(value) {
        if(_.isNull(value) || _.isUndefined(value)){
            return null;
        } else {
            return value;
        };
    }
    params.showExpiringSoon = checkNullOrUndefined(params.showExpiringSoon) || false;
    params.orderBy = checkNullOrUndefined(params.orderBy) || "averageRating";
    params.sort = checkNullOrUndefined(params.sort) || "desc";
    params.keyWords = checkNullOrUndefined(params.keyWords) || [];

    return params;
}


var buildQuery = function(params) {
    var query = {};

    addToQuery(query, params.genres, "genres.genreId");

    var averageRatingsArray = [];
    _.each(params.averageRatings, function(averageRating){
        _.times(10, function(i){
            averageRatingsArray.push(averageRating + "." + i);
        });
        if(averageRating === "0") {
            averageRatingsArray.push(null);
        }
    });
    averageRatingsArray.sort();
    addToQuery(query, averageRatingsArray, "averageRating");
    addToQuery(query, params.releaseYears, "releaseYear");

    if(params.showExpiringSoon === "true") {
        var now = moment();
        query.availableUntil = {$gte: now.format('YYYY-MM-DD hh:mm:ss'), $lte: now.add('days', 90).format('YYYY-MM-DD hh:mm:ss')};
    }

    if(_.isEmpty(params.keyWords) === false) {
        query["$or"] = [
            {"title": { $regex: new RegExp(params.keyWords[0]+"+", "i")}},
            {"cast.name": { $regex: new RegExp(params.keyWords[0]+"+", "i")}},
            {"directors.name": { $regex: new RegExp(params.keyWords[0]+"+", "i")}}
        ];
    }
    
    query.category = "movies";
    query.deletedFromNetflix = false;
    return query;
};


var buildSortCriteria = function(params) {
    if(params.showExpiringSoon === "true") {
        params.orderBy = "availableUntil";
        params.sort = "asc";
    }   

    var sortCriteria = {};
    if(params.sort === "asc") {
        sortCriteria[params.orderBy] = 1; 
    } else {
        sortCriteria[params.orderBy] = -1; 
    }    
    return sortCriteria;
}


var addToQuery = function(query, params, paramName) {
    if(_.isUndefined(params) === false && _.isNull(params) === false) {
        var array = new Array();
        if(_.isArray(params)) {
            _.each(params, function(param){
                array.push(param);
            });
        } else {
            array.push(params);
        }
        if(_.isEmpty(array) === false) {
            query[paramName] = {$in: array};
        }
    }
    return query;
};


//curl -H 'Content-Type: application/json' -X POST -d '{"netflixId": "1234568", "category":"movie", "title": "127 Hours", "synopsis": "Good Movie to watch", "language": "English", "releaseYear": "2007","length": "5159", "availableFrom": "1360483200","availableUntil": "1455091200","netflixUpdated": "1360917366089", "directors": [{"personId":"1", "name": "Terence H. Winkless-ness"}], "genres":[{"genreId":"1", "name":"action"}]}' http://localhost:3000/netflix/catalog/addOrUpdate
exports.addOrUpdate = function(req, res) {
    return Catalog.findOne({netflixId: req.body.netflixId}, function (err, catalog) {
        if (err == null && catalog != null) {
            console.log("Document Exists");
            catalog.netflixId = req.body.netflixId;
            catalog.title = req.body.title;
            catalog.synopsis = req.body.synopsis;
            catalog.shortSynopsis = req.body.shortSynopsis;
            catalog.boxArt = req.body.boxArt;
            catalog.language = req.body.language;
            catalog.category = req.body.category;
            catalog.maturityRating = req.body.maturityRating;
            catalog.averageRating = req.body.averageRating;
            catalog.releaseYear = req.body.releaseYear;
            catalog.length = req.body.length;                                         
            catalog.availableFrom = req.body.availableFrom*1000;
            catalog.availableUntil = req.body.availableUntil*1000;
            catalog.netflixUpdated = req.body.netflixUpdated;
            catalog.categories = req.body.categories;
            catalog.cast = req.body.cast;
            catalog.directors = req.body.directors;
            catalog.genres = req.body.genres;
            catalog.deletedFromNetflix = false;
            catalog.updatedAt = moment().format();
        } else {
            catalog = new Catalog(req.body);
            catalog.availableFrom = req.body.availableFrom*1000;
            catalog.availableUntil = req.body.availableUntil*1000;
            console.log("New Document");
        }

        catalog.save(function (err) {
            if (!err) {
                console.log("saved");
            } else {
                console.error("Error Exists => " + err);
            }
            return res.send(catalog);
        });
    });
};
