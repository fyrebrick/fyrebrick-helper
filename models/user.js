const mongoose = require('mongoose');

const User = new mongoose.Schema({
        userName:{
            type:String
        },
        isAcceptedCookies:{
            default:true, 
            type:Boolean
        },
        isBlocked:{
            type:Boolean,
            default:true
        },
        API_call_amount:{
            daily:{
                type:Number,
                default:0
            },
            total:{
                type:Number,
                default:0
            }
        },
        name: {
            type: String,
        },
        update_interval:{
            type:Number,
            default:5
        },
        googleId: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            index: true,
            required: true,
            minlength: 5,
            maxlength: 255,
        },
        creationDate: {
            type: Date,
            default: Date.now
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        lastLogin: {
            type: Date,
            default: Date.now
        },
        tokens: [{
            type: Object
        }],
        setUpComplete : {
            type: Boolean,
            default: false
        },
        CONSUMER_KEY : String,
        CONSUMER_SECRET : String,
        TOKEN_SECRET : String,
        TOKEN_VALUE : String,
        isBricklinkCallback: {
            type:Boolean,
            default: false
        },
        TOKENS:[{
            ip:String,
            SECRET:String,
            VALUE:String
            }],
        rank:{
            global:{
                views:[
                    {
                        date:Date,
                        rank:Number
                    }
                    ],
                lots:[
                    {
                        date:Date,
                        rank:Number
                    }
                ],
                items:[
                    {
                        date:Date,
                        rank:Number
                    }
                ],
            },
            national:{
                views:[
                    {
                        date:Date,
                        rank:Number
                    }
                ],
                lots:[
                    {
                        date:Date,
                        rank:Number
                    }
                ],
                items:[
                    {
                        date:Date,
                        rank:Number
                    }
                ],
            },
        }
    },
);

const user = mongoose.model('User', User);

exports.getUserFromGoogleId = async (gId) => {
    user.findOne({googleId: gId}, function (err, User) {
        if (err) throw new Error(err);
        return User;
    });
};

exports.getUserIdFromGoogleId = async (gId) => {
    user.findOne({googleId: gId}, function (err, User) {
        if (err) throw new Error(err);
        return User._id;
    })
};

module.exports = user;

