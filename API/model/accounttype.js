const mongoose = require('mongoose');
const accounttypeSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : String,
});

module.exports = mongoose.model('AccountType', accounttypeSchema);