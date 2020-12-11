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

//Router public to perform payment YANG KEPAKAI INI!!!!
router.get('/public/pay/:phonenumber/:merchant_id/:securitypin/:amount', (req, res, next) => {
    console.log({
        phonenumber : req.params.phonenumber,
        _id: req.params.merchant_id,
        securitypin : req.params.securitypin,
        amount : Number(req.params.amount)

    })
    Customer.findOne({phonenumber : req.params.phonenumber}).exec().then(customer => {
        if(customer.balance < req.params.amount){
            return res.status(401).json({
                message: "Not enough balance",
                status : 401
            })
        }
        Merchant.findOne({_id: req.params.merchant_id}).exec().then(merchant => {
            if(!merchant){
                return res.status(401).json({
                    message: "Merchant not found!",
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
                        Customer.findOneAndUpdate({phonenumber : req.params.phonenumber}, {balance : Number(customer.balance) - Number(req.params.amount)}, {new: true}, (err, customerData) => {
                            Merchant.findOneAndUpdate({_id: req.params.merchant_id}, {merchant_balance : Number(merchant.merchant_balance) + Number(req.params.amount)}, {new : true}, (err, merchantData) => {
                                res.status(200).json({
                                    customerData : customerData,
                                    merchantData: merchantData,
                                    amount : req.params.amount,
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

//Router to update user payment data
router.get('/public/pay/:phonenumber/:merchant_id/:securitypin/:newBalance/:newMerchantBalance', (req, res, next) => {
    Customer.find({phonenumber : req.params.phonenumber}).exec().then(user => {
        if(user.length < 1) {
            return res.status(401).json({
                message: "Auth Failed!sss",
                status : 401
            })
        }
        
        bcrypt.compare(req.params.securitypin, user[0].securitypin, (err, result) => {
            if(!result){
                return res.status(401).json({
                    message: "Auth Failed!",
                    status : 401
                })
            }
            if(result){
                Customer.findOneAndUpdate({phonenumber : req.params.phonenumber}, {balance : req.params.newBalance}, {new: true}, (err, data) => {
                    if(data < 1){
                        return res.status(401).json({
                            message: "Auth Failed!",
                            status : 401
                        })
                    }
                    else{
                        Merchant.findOneAndUpdate({_id : req.params.merchant_id}, {merchant_balance: req.params.newMerchantBalance}, {new : true}, (err2, result) => {
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
module.exports = router;