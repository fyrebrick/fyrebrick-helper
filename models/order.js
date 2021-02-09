const mongoose = require('mongoose');

const Order = new mongoose.Schema({
        items:[
            [
                {
                    inventory_id:Number,
                    isChecked:Boolean,
                    item: {
                        no:String,
                        name:String,
                        type:String,
                        category_id:Number,
                    },
                    color_id:Number,
                    color_name:String,
                    quantity:Number,
                    new_or_used:String,
                    completeness:String,
                    unit_price: String,
                    unit_price_final:String,
                    disp_unit_price:String,
                    disp_unit_price_final:String,
                    currency_code:String,
                    disp_currency_code:String,
                    remarks:String,
                    description:String,
                    weight:String
                }
            ]
        ],
        tags:[{
            text:String,
            id:Number,
            status:String
        }],
        tagCount:Number,
        tagsCaseSensitive:Boolean,
        consumer_key:String,
        description:String,
        orders_checked:Number,
        orders_total:Number,
        order_id : String,
        date_ordered : Date,
        date_status_changed : Date,
        seller_name : String,
        store_name : String,
        buyer_name : String,
        buyer_email : String,
        buyer_order_count : Number,
        require_insurance : Boolean,
        status : String,
        is_invoiced : Boolean,
        is_filed : Boolean,
        drive_thru_sent: Boolean,
        salesTax_collected_by_bl : Boolean,
        remarks : String,
        total_count : Number,
        unique_count: Number,
        total_weight:Number,
        payment:   {
            method: String,
            currency_code: String,
            date_paid: Date,
            status : String
        },
        shipping:{
            method: String,
            method_id:Number,
            tracking_no: String,
            tracking_link: String,
            date_shipped: Date,
            address:{
                name: {
                    full:String,
                    first: String,
                    last: String
                },
                full: String,
                address1: String,
                address2: String,
                country_code: String,
                city: String,
                state:String,
                postal_code:String
            },
        },
        cost:{
            currency_code:String,
            subtotal: String,
            grand_total: String,
            salesTax_collected_by_bl: String,
            final_total:String,
            etc1:String,
            etc2:String,
            insurance:String,
            shipping:String,
            credit:String,
            coupon:String,
            vat_rate:String,
            vat_amount:String
        },
        disp_cost:{
            currency_code:String,
            subtotal:String,
            grand_total:String,
            final_total:String,
            salesTax_collected_by_bl:String,
            etc1:String,
            etc2:String,
            insurance:String,
            shipping:String,
            credit:String,
            coupon:String,
            vat_rate:String,
            vat_amount:String
        }
    },
    { typeKey: '$type' }
);

const order = mongoose.model('Order', Order);


module.exports = order;

