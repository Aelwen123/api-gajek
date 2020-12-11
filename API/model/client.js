const mongoose = require('mongoose');
const clientSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    clientID : String,
    clientSecret : String
});

module.exports = mongoose.model('Client', clientSchema);