const Order = require("../../../models/order");
const mappingOrderItemsForChecked = require('../../mappingOrderItemsForChecked');
const logger  = require("../../../helpers/logger");
const OAuth = require('oauth');
const {increaseApiCallAmount,hasUserExceededAPiAmount} = require('../../../helpers/ApiHelper');
const _ = require('lodash');

/**
 * @method updateOrCreateOrder
 * @description
 * Update or create an order in the database.
 * @param {Order} order 
 * @param {User} user
 * @example
 * await updateOrCreateOrder(new Order({order_id:1,status:'PENDING'}));
 */
const updateOrCreateOrder = async (order,user)=>{
    //1. Find the order in the database
    let order_db = await Order.findOne({consumer_key:user.CONSUMER_KEY,order_id:order.order_id});
    if(order_db){
        //if status is the same and total count is the same and the unique count is the same. then dont update this order
        if(order_db.status==order.status&&order_db.total_count==order.total_count&&order_db.unique_count==order.unique_count){
            return;
        }
    }   
    logger.info(`new order update or creation for order ${order.order_id}`);
    if(await hasUserExceededAPiAmount(user._id)){
        logger.error(`User has exceeded the API limit of bricklink`);
        return;
    }
    await increaseApiCallAmount(user._id);
    //2. receive this orders items from bricklink
    
    const oauth = new OAuth.OAuth(
        user.TOKEN_VALUE,
        user.TOKEN_SECRET,
        user.CONSUMER_KEY,
        user.CONSUMER_SECRET,
        "1.0",
        null,
        "HMAC-SHA1"
    );
    await oauth.get("https://api.bricklink.com/api/store/v1/orders/"+order.order_id+"/items",oauth._requestUrl, oauth._accessUrl, 
    async (err, data_items) => {

        //? error handling on bricklink request
        if(err){
            logger.error(`receiving order items for user ${user.email} gave error : ${err}`);
            if(err.code='ETIMEDOUT'){
                //? timeout error
                logger.warn(JSON.stringify(data_items));
                logger.warn(`Timeout received by bricklink API from user ${user.email}`);
                return false;
            }else if(err.code="ECONNRESET"){
                //? Connection reset error
                logger.warn(`Connection reset, please check your internet connection`);
                return;
            }
        }

        //3. Parse the data given on the request to an object
        try{
            data_items = JSON.parse(data_items);
        }catch(e){
            //? this may crash, thats why this error handling is needed
            logger.warn(`Parsing order items failed, err: ${e}`);
        }

        //4. Check if the data exists and has a status code of 200
        if(data_items && data_items.meta && data_items.meta.code==200){

            //? If the status  of the current order is PURGED (Meaning the items of this order is deleted by bricklink), do not update the order
            if(order.status.toUpperCase()==="PURGED"){
                return;
            }
            //5. Check if the order does not exists yet in the database
            if(!order_db){
                logger.info(`Order of id ${order.order_id} not found in our database for user ${user.email}`);
                //? set all items property 'isChecked' to false default.
                data_items.data.forEach((batch)=>{
                    batch.forEach((item)=>{
                        item['isChecked']=false;
                    })
                })
                //6. Create a new mongo Order document
                const newOrder = new Order({
                    orders_checked:0,
                    description:"",
                    consumer_key:user.CONSUMER_KEY,
                    ...order,
                    items:data_items.data
                });
                //7. Save the new Order
                await newOrder.save((err,data)=>{
                    if(err){
                        logger.error(`Could not save new order ${order.order_id} of user ${user.email} ${err}`);
                        return false;
                    }
                });
            }else{
                //6 update the order 
                logger.debug(`updating order ${order.order_id}`);
                let orders_checked = 0;
                const checkedMap = mappingOrderItemsForChecked(order_db.items);
                data_items.data.forEach((batch)=>{
                    batch.forEach((item)=>{
                        item['isChecked'] = checkedMap.get(item.inventory_id);
                        if(item['isChecked']){
                            orders_checked++;
                        }
                    })  
                })
                const order_dbObj = {
                    orders_checked:orders_checked,
                    description:order_db.description,
                    consumer_key:user.CONSUMER_KEY,
                    ...order,
                    items:data_items.data
                };
                Order.updateOne({consumer_key:user.CONSUMER_KEY,order_id:order.order_id},order_dbObj,(err,data)=>{
                    if(err){
                        logger.error(`Could not update order ${order.order_id} of user ${user.email} : ${err}`);
                        return;
                    }
                });
            }
        }else{
            logger.warn(`Could not receive any data to update orders items for user ${user.email}`);
        }
        
    });
}

const removeAllDuplicates = async (CONSUMER_KEY) => {
    //1. Get all order
    const allOrders = await Order.find({consumer_key: CONSUMER_KEY});
    //2. map all orders with order_id
    const orders =  allOrders.map((order)=>{
        return Number(order.order_id);
    });
    //3. check for duplicates
    const findDuplicates = (dupes) => {
        dupes.filter((order_id,index)=>{
            orders.indexOf(order_id) != index
        }
        );
    }
    const duplicates = [...new Set(findDuplicates(orders))];
    //4. delete all duplicates
    logger.warn('found '+duplicates.length+'duplicates, removing')
    duplicates.orders.forEach(order_id=>{
        Order.deleteOne({order_id:order_id});
    });
}

module.exports = {
    updateOrCreateOrder,
    removeAllDuplicates
};
