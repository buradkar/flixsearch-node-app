var mongoose = require('mongoose')
, moment = require('moment')
, qs = require('qs')
, _ = require('underscore')
, Catalog = mongoose.model('Catalog')
, Tag = mongoose.model('Tag')
, GenreStat = mongoose.model('GenreStat')
;

exports.search = function(searchParamArray) {
    var results = [];
    var returnSize = searchParamArray.length;
    var count = 0;
    _.each(searchParamArray, function(searchRequest, i) {
        queryDb(searchRequest, function(err, catalog) {
            count++;
            console.log(catalog);
            // results.push(catalog);
            // if(count == returnSize) {
                // return results ;
                return [] ;
            // }
        })        
    });
};

var queryDb = function(params, callback) {
    var searchParam = setSearchDefaults(params);
    var searchQuery = buildQuery(searchParam);
    var sortCriteria = buildSortCriteria(searchParam);

    console.log(searchQuery)
    var query = Catalog.find(searchQuery).sort(sortCriteria).skip(params.skip).limit(params.pageSize);
    return query.execFind(function (err, catalogs) {
        return callback(err, catalogs);
    });
}


var getSearchParam = function(searchRequest, callback) {
    var params = {};
    params.searchParam = {};
    params.tagName = req.query.tag;
    
    if(_.isUndefined(req.query.tag) === false) {
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
    params.pageSize = checkNullOrUndefined(params.pageSize) || 25;
    params.pageNumber = checkNullOrUndefined(params.pageNumber) || 1;
    params.skip = (params.pageNumber - 1)*params.pageSize;

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