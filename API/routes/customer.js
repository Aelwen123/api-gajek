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

//Router to get customer balance
router.post('/balance', checkAuth, (req, res, next) => {
    Customer.findOne({phonenumber: req.body.phonenumber}).select('name balance -_id').exec().then(result => {
        res.status(200).json(result);
    })
})

//Public Router to get customer balance
router.get('/open_API_balance', (req, res, next) => {
    Customer.find({phonenumber: req.body.phonenumber}).select('name balance -_id').exec().then(result => {
        res.status(200).json(result);
    })
})

//Router for customers to sign up
router.post('/signup', (req, res, next) => {
    Customer.find({phonenumber: req.body.phonenumber}).exec().then(user => {
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
                    const customer = new Customer({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        phonenumber: req.body.phonenumber,
                        email: req.body.email,
                        securitypin: hash,
                        balance: 8000
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

router.post('/login', (req, res, next) => {
    Customer.find({phonenumber : req.body.phonenumber}).exec().then(user => {
        if(user.length < 1) {
            return res.status(401).json({
                message: "Auth Failed!"
            })
        }
        bcrypt.compare(req.body.securitypin, user[0].securitypin, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: "Auth Failed!"
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
                    userEmail: user[0].email
                })
            }
        })
    })
})

module.exports = router;