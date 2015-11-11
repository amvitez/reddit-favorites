var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Favorite = new Schema({
	userID: {
		type: Schema.ObjectId,
		ref: 'Account'
	},
	redditID: String,
	title: String,
	url: String,
	thumbnail: String
});

module.exports = mongoose.model('Favorite', Favorite);