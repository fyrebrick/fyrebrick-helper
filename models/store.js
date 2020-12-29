const mongoose = require('mongoose');

const Store = new mongoose.Schema({
        name: String,
        countryID:String,
        username: String,
        lastUpdated: Date,
        n4totalLots: Number,
        n4totalItems: Number,
        n4totalViews: Number
    }
);

const store = mongoose.model('Store', Store);

module.exports = store;

