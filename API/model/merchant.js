const mongoose = require('mongoose');

const merchantSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    merchant_QRIS_id : String,
    merchant_name : String,
    merchant_phonenumber : {
        type : String,
        unique : true,
    },
    merchant_email: String,
    marchant_securitypin : String,
    merchant_balance : Number
});

module.exports = mongoose.model('Merchant', merchantSchema);