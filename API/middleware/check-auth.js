const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try{
        const token = req.body.token;
        const decode_token = jwt.decode(token)
        if(decode_token.userPhonenumber != req.body.phonenumber){
            return res.status(401).json({
                message: "Auth failed dif phone",
            })
        }
        const verify = jwt.verify(token, process.env.JWT_KEY)
        req.userData = verify
    }catch(error){
        return res.status(401).json({
            message: 'Auth failed token failed'
        })
    }
    next()
}