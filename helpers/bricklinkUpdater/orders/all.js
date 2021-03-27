const {updateOrCreateOrder} = require('./utils');
const OAuth = require('oauth');
const logger  = require("../../../helpers/logger");
const {increaseApiCallAmount,hasUserExceededAPiAmount} = require('../../../helpers/ApiHelper');
const _ = require('lodash');

module.exports = async (user,query="")=>{
    //authentication for this user
    const oauth = new OAuth.OAuth(
        user.TOKEN_VALUE,
        user.TOKEN_SECRET,
        user.CONSUMER_KEY,
        user.CONSUMER_SECRET,
        "1.0",
        null,
        "HMAC-SHA1"
    );
    //make the bricklink api request to get all the orders
    if(await hasUserExceededAPiAmount(user._id)){
        logger.error(`User has exceeded the API limit of bricklink`);
        return;
    }
    await increaseApiCallAmount(user._id);
    await oauth.get("https://api.bricklink.com/api/store/v1/orders"+query,oauth._requestUrl, oauth._accessUrl, 
        async (err, data) => {
            //error handling
            if(err){
                logger.error(`receiving order items for user ${user.email} gave error : ${err}`);
                if(err.code='ETIMEDOUT'){
                    logger.warn(JSON.stringify(data));
                    logger.warn(`Timeout received by bricklink API from user ${user.email}`);
                    return false
                }else if(err.code="ECONNRESET"){
                    logger.warn(data);
                    logger.warn(`Connection reset, please check your internet connection`);
                    return;
                }else{
                    logger.warn(`Error ${err.code}: retrying later...`);
                    return;
                }
            }
            try{
            data = JSON.parse(data);
            }catch(e){
                logger.error(`could not parse data for orders for user ${user.email}: ${e}`);
                return false;
            }
            if(data && data.meta && data.meta.code==200){
                logger.info(`Found ${data.data.length} orders for user ${user.email}`);
                if(await hasUserExceededAPiAmount(user._id,data.data.length)){
                    logger.error(`User has exceeded the API limit of bricklink'`);
                    return;
                }
                let orderprocessed = 0;
                data.data.forEach(
                    async (order) => {
                        await updateOrCreateOrder(order,user);
                        orderprocessed++;
                        if(orderprocessed===data.data.length){
                            console.log("all orders processed");
                        }
                    }
                );
                logger.info(`successfully found all orders for user ${user.email}`);
            }else{
                logger.warn(`Could not receive any data to update orders for user ${user.email} : ${data.meta.description}`);
            }
        }
    );
    
}