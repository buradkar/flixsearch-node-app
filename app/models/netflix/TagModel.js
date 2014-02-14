var mongoose = require('mongoose')
, Schema = mongoose.Schema
;

var TagSchema = new Schema({
    name: { type: String, required: true, index: {unique: true}},
    searchParam: {type: Object, required: true},
    rating: {type: Number, required: true, default: 0},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
}
, { autoIndex: false }
);

mongoose.model('Tag', TagSchema, 'catalogs.tags');