const { logger } = require("../helpers/logger");
const User = require("../models/user");
const increaseApiCallAmount = (_id,length=1) => {
    return new Promise(async(resolve, reject) =>{
        const user = await User.findOne({_id:_id});
        const usersWithSameCONSUMER_KEY = await User.find({CONSUMER_KEY:user.CONSUMER_KEY});
        await usersWithSameCONSUMER_KEY.forEach(async _user=>{
            await User.updateOne({_id:_user.id},{"API_call_amount.daily":_user.API_call_amount.daily+length,'API_call_amount.total':_user.API_call_amount.total+length},(err,data)=>{
                if(err){
                    logger.error(`Incrementing API call amount for user ${user.email} gave error, err: ${err.message}`);
                    reject(err);
                }else{
                    
                    logger.info(`Incremented API call amount for user ${user.email} to ${user.API_call_amount.daily+length}`);
                    resolve(data);
                }
            });
        });
    });
}
const hasUserExceededAPiAmount = async(_id,length)=>{
    const user = await User.findOne({_id:_id});
    if(user.API_call_amount.daily>= 5000-length){
        logger.error(`user has exceeded api call amount`);
        return true;
    }else{
        return false;
    }
}
module.exports = {
    increaseApiCallAmount,
    hasUserExceededAPiAmount
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}