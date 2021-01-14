const express = require('express');
const router = express.Router();
const AccountType = require('../model/accounttype');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const accounttype = require('../model/accounttype');

//Router to get all customers data
router.get('/', (req, res, next) => {
    AccountType.find().exec().then(result=>{
        res.status(200).json(result);
    })
})

//Router for customers to sign up
router.post('/addAccountType', (req, res, next) => {
    AccountType.find({name: req.body.name}).exec().then(accounttype => {
        if(accounttype.length >=1){
            return res.status(409).json({
                message: "Account Type exists!",
                status: 409
            });
        } else{
            const accounttype = new AccountType({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
            });

            accounttype.save().then(result => {
                res.status(200).json(result)
            })
        }
    });
});

module.exports = router;