module.exports = {
    models : {
        Inventory:require('./models/inventory'),
        Order:require('./models/order'),
        User:require('./models/user'),
        Store:require('./models/store')
    },
    helpers:{
        apiHelper: require('./helpers/ApiHelper'),
        bricklink: require('./helpers/bricklink'),
        logger: require('./helpers/logger'),
        isObjectsSame: require('./helpers/isObjectsSame'),
        mappingOrderItemsForChecked: require('./helpers/mappingOrderItemsForChecked'),
        getStores:require('./helpers/getStores'),
        removeAllDuplicates:require('./helpers/bricklinkUpdater/orders/utils').removeAllDuplicates
    },
};