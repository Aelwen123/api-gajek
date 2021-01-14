const mongoose = require('mongoose');
const customerSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : String,
    phonenumber : {
        type : String, 
        unique : true,
    },
    email: String,
    securitypin : String,
    balance : Number,
    accounttype: String,
});

module.exports = mongoose.model('Customer', customerSchema);