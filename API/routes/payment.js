const express = require('express');
const router = express.Router();
const Customer = require('../model/customer');
const Merchant = require('../model/merchant');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Router to update user payment data
router.post('/', (req, res, next) => {
    Customer.findOneAndUpdate({phonenumber : req.body.phonenumber}, {balance : req.body.newBalance}, {new: true}, (err, data) => {
        if(data < 1){
            return res.json(err)
        }
        
        else{
            Merchant.findOneAndUpdate({_id : req.body.merchant_id}, {merchant_balance: req.body.newMerchantBalance}, {new : true}, (err2, result) => {
                if(result < 1){
                    return res.json(err2)
                }
                else{
                    res.status(200).json({
                            message : "Payment successfull",
                            merchant : result,
                            customer : data
                    })
                }
            })
        }
    })
})



module.exports = router;