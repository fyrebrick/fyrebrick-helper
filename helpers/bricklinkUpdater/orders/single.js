const {updateOrCreateOrder} = require('./utils');
const OAuth = require('oauth');
const logger  = require("../../../helpers/logger");
const {increaseApiCallAmount,hasUserExceededAPiAmount} = require('../../../helpers/ApiHelper');
const _ = require('lodash');

module.exports = async(user,order_id) => {
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
        logger.error(`User has exceeded the API limit of bricklink'`);
        return;
    }
    await increaseApiCallAmount(user._id);
    await oauth.get("https://api.bricklink.com/api/store/v1/orders/"+order_id+query,oauth._requestUrl, oauth._accessUrl, 
        async (err, data) => {
            //search for the order in the database
            try{
                data = JSON.parse(data);
            }catch(e){
                logger.error(`could not parse data for orders for user ${user.email}: ${e}`);
                return;
            }
            await increaseApiCallAmount(user._id,data.data.length);
            await updateOrCreateOrder(order,user);
            return;
        });
    };
