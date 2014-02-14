var mongoose = require('mongoose')
, Schema = mongoose.Schema
;

var GenreSchema = new Schema({
    _id: {type: Object},
    value: {type: Number}
}
, { autoIndex: false }
);

mongoose.model('GenreStat', GenreSchema, 'catalogs.genrestats');