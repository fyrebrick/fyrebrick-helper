
const OAuth = require('oauth');
const Inventory = require('../../../models/inventory');
const logger  = require("../../../helpers/logger");
const {increaseApiCallAmount,hasUserExceededAPiAmount} = require('../../../helpers/ApiHelper');
const _ = require('lodash');

module.exports = async (user,inventory_id) => {
    await Inventory.findOne({CONSUMER_KEY:user.CONSUMER_KEY,inventory_id:inventory_id},async(err, data)=>{
        if(err){
            logger.error(`Could not find inventory for user ${user.email} : ${err}`);
            return false;
        }else{
            const oauth = new OAuth.OAuth(
                user.TOKEN_VALUE,
                user.TOKEN_SECRET,
                user.CONSUMER_KEY,
                user.CONSUMER_SECRET,
                "1.0",
                null,
                "HMAC-SHA1"
            );
            if(await hasUserExceededAPiAmount(user._id)){
                logger.error(`User has exceeded the API limit of bricklink'`);
                return;
            }
            await increaseApiCallAmount(user._id);
            await oauth.get("https://api.bricklink.com/api/store/v1/inventories/"+inventory_id,oauth._requestUrl, oauth._accessUrl, 
            async (err, data) => {
                if(err){
                    logger.error(`receiving order items for user ${user.email} gave error : ${err}`);
                    if(err.code='ETIMEDOUT'){
                        logger.warn(JSON.stringify(data));
                        logger.warn(`Timeout received by bricklink API from user ${user.email}`);
                        return false;
                    }else if(err.code="ECONNRESET"){
                        logger.warn(`Connection reset, please check your internet connection`);
                        return;
                    }
                }
                if(data && data.meta && data.meta==200){
                    let updatedInventoryItem = {
                        CONSUMER_KEY:user.CONSUMER_KEY,
                        ...data
                    }
                    await Inventory({CONSUMER_KEY:user.CONSUMER_KEY,inventory_id:inventory_id},updatedInventoryItem);
                }else{
                    logger.error(`Could not update single inventory ${inventory_id} for user ${user.email}: ${err}`);
                    return false;
                }
            });
        }
    });
}