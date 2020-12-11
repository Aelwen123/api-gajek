const Client = require('../model/client')

module.exports = (req, res, next) => {
    try{
        const clientID = req.body.clientID;
        const clientSecret = req.body.clientSecret;
        Client.findOne({clientID : clientID}).exec().then(result => {
            if(!result){
                return res.status(401).json({
                    message: "Auth Failed! client iD not found",
                    status: 401
                })
            }
            else {
                bcrypt.compare(clientSecret, result.clientSecret, (err, result) => {
                    if(!result){
                        return res.status(401).json({
                            message: "Auth Failed!",
                            status: 401
                        })
                    }
                })
            }
        })
    }catch(error){
        return res.status(401).json({
            message: 'Auth failed token failed'
        })
    }
    next()
}