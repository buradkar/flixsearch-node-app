var mongoose = require('mongoose')
, Schema = mongoose.Schema
;

var ReleaseYearSchema = new Schema({
    _id: {type: Object},
    value: {type: Number}
}
, { autoIndex: false }
);

mongoose.model('ReleaseYearStat', ReleaseYearSchema, 'catalogs.releaseyearstats');