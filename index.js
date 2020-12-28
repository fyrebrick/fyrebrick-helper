module.exports = {
    models : {
        inventory = require('./models/inventory'),
        order = require('./models/order'),
        user = require('./models/user')
    },
    m: {i=require('./min/m/i.min'),o=require('./min/m/o.min'),u=require('./min/m/u.min')},
    helpers:{
        apiHelper: require('./helpers/ApiHelpers'),
        bricklink: require('./helpers/bricklink'),
        logger: require('./helpers/logger')
    },
    h:{a: require('./min/h/a.min'),b: require('./min/h/b.min'),l: require('./min/h/l.min')},
};