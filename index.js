module.exports = {
    models : {
        Inventory : require('./models/inventory'),
        Order : require('./models/order'),
        User : require('./models/user')
    },
    helpers:{
        apiHelper: require('./helpers/ApiHelper'),
        bricklink: require('./helpers/bricklink'),
        logger: require('./helpers/logger'),
        isObjectsSame: require('./helpers/isObjectsSame'),
        mappingOrderItemsForChecked: require('./helpers/mappingOrderItemsForChecked')
    },
};