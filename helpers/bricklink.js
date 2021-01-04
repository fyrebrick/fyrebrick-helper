module.exports = {
    order:{
        all:require('./bricklinkUpdater/orders/all'),
        single:require('./bricklinkUpdater/orders/single')
    },
    inventory:{
        all:require('./bricklinkUpdater/inventory/all'),
        single: require('./bricklinkUpdater/inventory/single')
    }
}