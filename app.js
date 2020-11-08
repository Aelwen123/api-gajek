const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const routeCustomer = require('./API/routes/customer');
const routePayment = require('./API/routes/payment');
const routeMerchant = require('./API/routes/merchant');

mongoose.connect('mongodb+srv://gajek:gajekHebat123@gajek.yqpjd.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useMongoClient: true
})

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();
})

// Routes untuk handle request
app.use('/customer', routeCustomer);
app.use('/payment', routePayment);
app.use('/merchant', routeMerchant);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error : {
            message: error.message
        }
    })
})

module.exports = app;