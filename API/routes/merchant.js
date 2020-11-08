const express = require('express');
const router = express.Router();
const Customer = require('../model/customer');
const Merchant = require('../model/merchant');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Router to get all customers data
router.get('/', (req, res, next) => {
    Merchant.find().exec().then(result=>{
        res.status(200).json(result);
    })
})

//Router search merchant from QRIS ID
router.get('/:qrisID', (req, res, next) => {
    Merchant.find({merchant_QRIS_ID: req.params.qrisID}).select('_id').exec().then(result => {
        res.status(200).json(result);
    })
})

//Router for customers to sign up
router.post('/signups', (req, res, next) => {
    Merchant.find({phonenumber_merchant: req.body.phonenumber}).exec().then(user => {
        if(user.length >=1){
            return res.status(409).json({
                message: "User exists!"
            });
        } else{
            bcrypt.hash(req.body.securitypin, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const merchant = new Merchant({
                        _id: new mongoose.Types.ObjectId(),
                        merchant_QRIS_id : req.body.QRIS_id,
                        merchant_name: req.body.name,
                        merchant_phonenumber: req.body.phonenumber,
                        merchant_email: req.body.email,
                        marchant_securitypin: hash,
                        merchant_balance: 0
                    });
        
                    merchant.save().then(result => {
                        res.status(200).json({
                            message: 'User with id [' + result._id + '] created',
                            createdUser:{
                                merchantID: result._id,
                                merchantQRIS_ID: result.merchant_QRIS_id,
                                merchantName: result.merchant_name,
                                merchantPhonenumber: result.merchant_phonenumber,
                                merchantEmail: result.merchant_email,
                                merchantSecurityPin: result.marchant_securitypin,
                                merchantBalance : result.merchant_balance,
                            }
                        });
                    }). catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    });
});

module.exports = router;