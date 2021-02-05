const mongoose = require('mongoose');

const Store = new mongoose.Schema({
        name: String,
        countryID:String,
        username: String,
        lastUpdated: Date,
        n4totalLots: Number,
        n4totalItems: Number,
        n4totalViews: Number,
        

        minBuy:Number,
        avgLotMinBuy:Number,
        sellerLotLimit:Number,
        slogan:String,
        date:Date,
        stateName:String,
        countryName:String,
        headerbg:String,
        headerText:String,
        logoImgUrl:String,
        idCardImgURL:String,
        userBstatus:Number,
        userSstatus:Number,
        userSince:Date,
        selerMinLots:Number,
        sellerVatID:Number,
        sellerVatCompanyName:String,
        sellerAvailable:String,
        sellerAboutMe:String,
        facebook:String,
        twitter:String,
        instagram:String,
        reddit:String,
        flickr:String,
        feedbackScore:Number,
        feedbackScore:[
            Number
        ],
        stats:{
            favorited:Number,
            totalOrders:Number,
            nrs:Number,
            refunds:Number,
            canceled:Number,
            shipsWithin:Number,
            responseTime:Number
        },
        verified:Boolean,
        checkout:Boolean,
        trusted:Boolean,
        sellerSplashType:String,
        sellerStoreBanner:String,
        sellerStoreBannerFgColor:String,
        sellerStoreBannerBgColor:String,
        sellerDefaultLandingPage:String,
        sellerSplashURL:String,
        sellerAvailable:String,
        StoreLocked:String,
        storeClosedUnlocked:Number,
        storeClosedNote:String,
        storeClosedDate:Date,

        
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
    }
);

const store = mongoose.model('Store', Store);

module.exports = store;

