module.exports = {
    models : {
        inventory = require('../models/inventory'),
        order = require('../models/order'),
        user = require('../models/user')
    },
    m: {i=require('../models/inventory'),o=require('../models/order'),u=require('../models/user')},

    helpers:{
        apiHelper: require('../helpers/ApiHelpers'),
        bricklink: require('./helpers/bricklink'),
        logger: require('../helpers/logger')
    }
};