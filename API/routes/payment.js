const express = require('express');
const router = express.Router();
const Customer = require('../model/customer');
const Merchant = require('../model/merchant');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const checkAuth = require('../middleware/check-auth')


//Router to check balance to amount
router.post('/checkBalance', (req, res, next) => {
    Customer.find({phonenumber: req.body.phonenumber}).exec().then(user => {
        if(user[0].balance < req.body.amount){
            return res.status(401).json({
                message: "Balance is not enough"
            })
        }
    })
})

//Router to update user payment data
router.post('/pay', checkAuth, (req, res, next) => {
    Customer.find({phonenumber : req.body.phonenumber}).exec().then(user => {
        if(user.length < 1) {
            return res.status(401).json({
                message: "Auth Failed!"
            })
        }
        
        bcrypt.compare(req.body.securitypin, user[0].securitypin, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: "Auth Password salah Failed!"
                })
            }
            if(result){
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
            }
        })
    })
})

module.exports = router;