const OAuth = require('oauth');
const Inventory = require('../../../models/inventory');
const logger  = require("../../../helpers/logger");
const {increaseApiCallAmount,hasUserExceededAPiAmount} = require('../../../helpers/ApiHelper');
const _ = require('lodash');

/**
 * @description updates and rewrites the users inventory model
 * @param {User} user - Mongodb User schema
 */
module.exports = async (user) => {
    const oauth = new OAuth.OAuth(
        user.TOKEN_VALUE,
        user.TOKEN_SECRET,
        user.CONSUMER_KEY,
        user.CONSUMER_SECRET,
        "1.0",
        null,
        "HMAC-SHA1"
    )
    // get inventory data
    
    if(await hasUserExceededAPiAmount(user._id)){
        logger.error(`User has exceeded the API limit of bricklink'`);
        return;
    }
    await increaseApiCallAmount(user._id);
    await oauth.get("https://api.bricklink.com/api/store/v1/inventories",oauth._requestUrl, oauth._accessUrl, 
        async (err, data) => {
            itemsProcessedFailed = false;
            if(err){
                logger.error(`receiving order items for user ${user.email} gave error : ${err}`);
                if(err.code='ETIMEDOUT'){
                    logger.warn(JSON.stringify(data));
                    itemsProcessedFailed = true;
                    logger.warn(`Timeout received by bricklink API from user ${user.email}`);
                    return false;
                }else if(err.code="ECONNRESET"){
                    logger.warn(data);
                    itemsProcessedFailed = true;
                    logger.warn(`Connection reset, please check your internet connection`);
                    return;
                }
            }
            try{
                data = JSON.parse(data);
                }catch(e){
                    logger.error(`could not parse data for inventory for user ${user.email}: ${e}`);
                    return false;
                }
            //check if inventory data is correct
            if(data && data.meta && data.meta.code==200){
                logger.info(`preparing to save ${data.data.length} items to inventory in our database for user ${user.email}`);
                // await Inventory.deleteMany({CONSUMER_KEY:user.CONSUMER_KEY});
                const totalItems = data.data.length;
                let itemsUpdated = 0;
                let itemsNew = 0;
                itemsProcessed = [];
                data.data.forEach(
                    async (item) => {
                        itemsProcessed.push(item.inventory_id);
                        const item_in_db = await Inventory.findOne({CONSUMER_KEY:user.CONSUMER_KEY,inventory_id:item.inventory_id});
                        //console.log(JSON.stringify(item),JSON.stringify(item_in_db));
                        if(!item_in_db){
                            //logger.debug(`did not found item ${item.inventory_id} for user ${user.CONSUMER_KEY} in database, creating new item`);
                            //new
                            itemsNew++;
                            const newItem = new Inventory(
                                {
                                    CONSUMER_KEY:user.CONSUMER_KEY,
                                    ...item
                                }
                            );
                            await newItem.save((err, data)=>{
                                if(err){
                                    logger.error(`Could not save new inventory item ${item.inventory_id} of user ${user.email}: ${err}`);
                                    return false;
                                }else{
                                    logger.info(`Successfully saved new inventory item ${item.inventory_id} for user ${user.email}`);
                                }
                            })
                        }else{
                            //logger.debug(`Found item ${item.inventory_id} in database, item in database is out of date. updating item ...`);
                            itemsUpdated++;
                            await Inventory.updateOne({
                                CONSUMER_KEY:user.CONSUMER_KEY,
                                inventory_id:item.inventory_id
                            },{
                                CONSUMER_KEY:user.CONSUMER_KEY,
                                ...item
                            },(err,data)=>{
                                if(err){
                                    logger.error(`Could not save new inventory item ${item.inventory_id} of user ${user.email}: ${err}`);
                                    return false;
                                }else{
                                    //logger.info(`Successfully updated inventory item ${item.inventory_id} for user ${user.email}`);
                                }
                            });
                        }
                    }
                );
                if(itemsProcessedFailed){
                    logger.warn('itemsProcessedFailed !!');
                }
                if(!itemsProcessedFailed){
                    allItems = await Inventory.find({CONSUMER_KEY:user.CONSUMER_KEY});
                    allItems.forEach(async (_item)=>{
                        if(itemsProcessed.indexOf(_item.inventory_id)===-1){
                            //logger.info(`removing ${_item.inventory_id}`);
                            await Inventory.deleteOne({inventory_id:_item.inventory_id,CONSUMER_KEY:user.CONSUMER_KEY});
                        }
                    })
                }
            }else{
                logger.warn(`Could not receive any data to update inventory for user ${user.email}: ${data.meta.description}`);
                logger.debug(`${data.meta.description}`)
            }
        }
    );
}