var mongoose = require('mongoose')
, Schema = mongoose.Schema
;

var CommentSchema = new Schema({   
    text: { type: String, default: null},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
}
, { autoIndex: false }
);

mongoose.model('Comment', CommentSchema, 'users.comments');