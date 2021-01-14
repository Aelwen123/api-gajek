const express = require('express');
const router = express.Router();
const Customer = require('../model/customer');
const Merchant = require('../model/merchant');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const checkAuth = require('../middleware/check-auth')
const checkClient = require('../middleware/check-client')


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
                message: "Auth Failed!",
                status : 401
            })
        }
        
        bcrypt.compare(req.body.securitypin, user[0].securitypin, (err, result) => {
            if(!result){
                return res.status(401).json({
                    message: "Auth Failed!",
                    status : 401
                })
            }
            if(result){
                Customer.findOneAndUpdate({phonenumber : req.body.phonenumber}, {balance : req.body.newBalance}, {new: true}, (err, data) => {
                    if(data < 1){
                        return res.status(401).json({
                            message: "Auth Failed!",
                            status : 401
                        })
                    }
                    else{
                        Merchant.findOneAndUpdate({_id : req.body.merchant_id}, {merchant_balance: req.body.newMerchantBalance}, {new : true}, (err2, result) => {
                            if(result < 1){
                                return res.status(401).json({
                                    message: "Auth Failed!",
                                    status : 401
                                })
                            }
                            else{
                                res.status(200).json({
                                        message : "Payment successfull",
                                        merchant : result,
                                        customer : data,
                                        status : 200
                                })
                            }
                        })
                    }
                })
            }
        })
    })
})

// //Router public to perform payment NGAKK KEPAKE LAGI 2!!!!
// router.get('/public/pay/:phonenumber/:merchant_id/:securitypin/:amount/:amountbefore', (req, res, next) => {
//     Customer.findOne({phonenumber : req.params.phonenumber}).exec().then(customer => {
//         if(customer.balance < req.params.amount){
//             return res.status(401).json({
//                 message: "Not enough balance",
//                 status : 401
//             })
//         }
//         Merchant.findOne({_id: req.params.merchant_id}).exec().then(merchant => {
//             if(!merchant){
//                 return res.status(401).json({
//                     message: "Merchant not found!",
//                     status : 401
//                 })
//             } else {
//                 bcrypt.compare(req.params.securitypin, customer.securitypin, (err, result) => {
//                     if(!result){
//                         return res.status(401).json({
//                             message: "Auth Failed!",
//                             status : 401
//                         })
//                     }
//                     if(result){
//                         Customer.findOneAndUpdate({phonenumber : req.params.phonenumber}, {balance : Number(customer.balance) - Number(req.params.amount)}, {new: true}, (err, customerData) => {
//                             Merchant.findOneAndUpdate({_id: req.params.merchant_id}, {merchant_balance : Number(merchant.merchant_balance) + Number(req.params.amountbefore)}, {new : true}, (err, merchantData) => {
//                                 res.status(200).json({
//                                     customerData : customerData,
//                                     merchantData: merchantData,
//                                     amount : req.params.amount,
//                                     status : 200
//                                 })
//                             })
//                         })
//                     }
//                 })
//             }
//         })
//     })
// })

//Router public to perform payment YANG KEPAKAI INI!!!!
router.get('/public/payBalance/:user_phonenumber/:securitypin/:amountAfter', (req, res, next) => {
    Customer.findOne({phonenumber : req.params.user_phonenumber}).exec().then(customer => {
        if(customer.balance < req.params.amountAfter){
            return res.status(401).json({
                message: "Not enough balance",
                status : 401
            })
        }
        Customer.findOne({phonenumber: "021987123", accounttype: "thirdparty"}).exec().then(thirdparty => {
            if(!thirdparty){
                return res.status(401).json({
                    message: "Third Party not found!",
                    status : 401
                })
            } else {
                bcrypt.compare(req.params.securitypin, customer.securitypin, (err, result) => {
                    if(!result){
                        return res.status(401).json({
                            message: "Auth Failed!",
                            status : 401
                        })
                    }
                    if(result){
                        Customer.findOneAndUpdate({phonenumber : req.params.user_phonenumber}, {balance : Number(customer.balance) - Number(req.params.amountAfter)}, {new: true}, (err, customerData) => {
                            Customer.findOneAndUpdate({phonenumber: "021987123"}, {balance : Number(thirdparty.balance) + Number(req.params.amountAfter)}, {new : true}, (err, thirdpartyData) => {
                                res.status(200).json({
                                    customerData : customerData,
                                    thirdpartyData: thirdpartyData,
                                    amount : req.params.amountAfter,
                                    status : 200
                                })
                            })
                        })
                    }
                })
            }
        })
    })
})


//Router to topUp
router.post('/topUp/phonenumber=:phonenumber/amount=:amount', (req, res, next) => {
    Customer.findOne({phonenumber : req.params.phonenumber}).exec().then(result => {
        if(!result){
            return res.status(401).json({
                message: "Auth Failed!",
                status : 401
            })
        }
        else{
            let customerBalance = result.balance + parseInt(req.params.amount)
            Customer.findOneAndUpdate({phonenumber : req.params.phonenumber}, {balance : customerBalance}, {new : true}, (err, result) => {
                res.status(200).json({
                    customer : result,
                    status : 200
                })
            })
        }
    })
})

router.get('/public/withdraw/balance/:phonenumber/:amount', (req, res, next) => {
    Customer.findOne({phonenumber: "021987123"}).exec().then(balance => {
        if(balance.balance < req.params.amount){
            return res.status(401).json({
                message : "Not enough balance",
                status : 401
            })
        }

        Customer.findOne({phonenumber : req.params.phonenumber}).exec().then(customer => {
            if(!customer){
                return res.status(401).json({
                    message : "Auth failed!",
                    status : 401
                })
            } else {
                Customer.findOneAndUpdate({phonenumber: balance.phonenumber}, {balance : Number(balance.balance) - Number(req.params.amount)}, {new : true}, (err, result) => {
                    Customer.findOneAndUpdate({phonenumber : req.params.phonenumber}, {balance : Number(customer.balance) + Number(req.params.amount)}, {new : true}, (err2, result2) => {
                        res.status(200).json({
                            message : "Withdrawal successfull",
                            status : 200,
                            receiver : result2
                        })
                    })
                })
            }
        })
    })
})
module.exports = router;