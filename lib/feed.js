const Feed = require('../models/feed-model');

exports.addFeed = async () => {
    let feed = new Feed({message: 'ada ada saja',workspace:'dudung'});
	let ret = await feed.save();
}

exports.getFeed = async () => {
    return Feed.find().exec()
}