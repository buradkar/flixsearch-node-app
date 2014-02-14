var mongoose = require('mongoose')
, Schema = mongoose.Schema
;

var personSchema = new Schema({
    personId: { type: String},
    name: { type: String},
});

var genreSchema = new Schema({
    genreId: { type: String},
    name: { type: String},
});

var CatalogSchema = new Schema({
    netflixId: { type: String, required: true, index: {unique: true}},
    title: { type: String, required: true},
    category: { type: String, required: true},
    synopsis: { type: String, default: null},
    shortSynopsis: { type: String, default: null},
    boxArt: { type: String, default: null},
    language: { type: String, default: null},
    maturityRating: { type: String, default: null},
    averageRating: { type: String, default: null},
    releaseYear: { type: Number, required: true},
    length: { type: Number, default: null},
    availableFrom: { type: Date, default: null},
    availableUntil: { type: Date, default: null},
    deletedFromNetflix: {type: Boolean, default: false},
    deletedFromNetflixOn: {type: Date},
    cast: [personSchema],
    directors: [personSchema],
    genres: [genreSchema],
    netflixUpdated: { type: Date, default: Date.now},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
}
, { autoIndex: false }
);

CatalogSchema.methods = {

    compare: function() {
        console.log("In compare");
    }
}

mongoose.model('Catalog', CatalogSchema);