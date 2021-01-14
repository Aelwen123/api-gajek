const express = require('express');
const router = express.Router();
const Customer = require('../model/customer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth')

//Router to get all customers data
router.get('/', (req, res, next) => {
    Customer.find().exec().then(result=>{
        res.status(200).json(result);
    })
})

router.post('/getCustomer', checkAuth, (req, res, next) => {
    Customer.findOne({phonenumber: req.body.phonenumber}).select('-_id -securitypin').exec().then(result => {
        res.status(200).json(result)
    })
})

router.post('/public/getCustomer', (req, res, next) => {
    Customer.findOne({phonenumber: req.body.phonenumber}).select('-_id -securitypin').exec().then(result => {
        if(!result){
            return res.status(401).json({
                message : "Customer not found!",
                status: 401
            })
        }
        res.status(200).json({
            result : result,
            status : 200
        })
    })
})

router.get('/public/getCustomer/:phonenumber', (req, res, next) => {
    Customer.findOne({phonenumber: req.params.phonenumber}).select('-_id -securitypin').exec().then(result => {
        if(!result){
            return res.status(401).json({
                message : "Customer not found!",
                status : 401
            })
        }
        else{
            res.status(200).json(result)
        }
    })
})


//Router to get customer balance
router.post('/balance', checkAuth, (req, res, next) => {
    Customer.findOne({phonenumber: req.body.phonenumber}).select('name balance -_id').exec().then(result => {
        res.status(200).json(result);
    })
})

//Public Router to get customer balance
router.get('/public/balance/:phonenumber', (req, res, next) => {
    Customer.findOne({phonenumber: req.params.phonenumber}).select('balance -_id').exec().then(result => {
        res.status(200).json(result);
    })
})

//Router for customers to sign up
router.post('/signup', (req, res, next) => {
    Customer.find({phonenumber: req.body.phonenumber, accounttype: "basic"}).exec().then(user => {
        if(user.length >=1){
            return res.status(409).json({
                message: "User exists!",
                status: 409
            });
        } else{
            bcrypt.hash(req.body.securitypin, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const customer = new Customer({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        phonenumber: req.body.phonenumber,
                        email: req.body.email,
                        securitypin: hash,
                        balance: 1000000,
                        accounttype: "basic"
                    });
        
                    customer.save().then(result => {
                        res.status(200).json({
                            message: 'User with id [' + result._id + '] created',
                            createdUser:{
                                userID : result._id,
                                userName: result.name,
                                userEmail: result.email,
                                userSecurityPin: result.securitypin,
                                balance : result.balance,
                                accounttype: result.accounttype
                            },
                            status: 200
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

//Router for customers to sign up
router.post('/signup/thirdparty', (req, res, next) => {
    Customer.find({phonenumber: req.body.phonenumber, accounttype: "thirdparty"}).exec().then(user => {
        if(user.length >=1){
            return res.status(409).json({
                message: "User exists!",
                status: 409
            });
        } else{
            bcrypt.hash(req.body.securitypin, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const customer = new Customer({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        phonenumber: req.body.phonenumber,
                        email: req.body.email,
                        securitypin: hash,
                        balance: 5000000,
                        accounttype: "thirdparty"
                    });
        
                    customer.save().then(result => {
                        res.status(200).json({
                            message: 'User with id [' + result._id + '] created',
                            createdUser:{
                                userID : result._id,
                                userName: result.name,
                                userEmail: result.email,
                                userSecurityPin: result.securitypin,
                                balance : result.balance,
                                accounttype: result.accounttype
                            },
                            status: 200
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


router.post('/login', (req, res, next) => {
    Customer.find({phonenumber : req.body.phonenumber}).exec().then(user => {
        if(user.length < 1) {
            return res.status(401).json({
                message: "Auth Failed!",
                status: 401
            })
        }
        bcrypt.compare(req.body.securitypin, user[0].securitypin, (err, result) => {
            if(!result){
                return res.status(401).json({
                    message: "Auth Failed!",
                    status: 401
                })
            }
            if(result){
                const token = jwt.sign({
                    userID : user[0]._id,
                    userName: user[0].name,
                    userEmail: user[0].email,
                    userPhonenumber : user[0].phonenumber
                }, 'secret', {expiresIn : '1h'})
                return res.status(200).json({
                    message: "Auth Successfull!",
                    token: token,
                    status: 200,
                    userPhonenumber : user[0].phonenumber,
                    userName: user[0].name,
                    userEmail: user[0].email,
                    accountType : user[0].accounttype
                })
            }
        })
    })
})

module.exports = router;