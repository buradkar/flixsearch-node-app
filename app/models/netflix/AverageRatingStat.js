var mongoose = require('mongoose')
, Schema = mongoose.Schema
;

var AverageRatingSchema = new Schema({
    _id: {type: Object},
    value: {type: Number}
}
, { autoIndex: false }
);

mongoose.model('AverageRatingStat', AverageRatingSchema, 'catalogs.averageratingstats');