const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/keys').token.secret;

module.exports = function(req,res,next){
    if(req.token){
        try {
            let decode = jwt.verify(req.token,JWT_SECRET);
            next();
        } catch (error) {
            res.status(401).json({message: error.message, status:0});
        }
    }else{
        res.status(401).json({message: "no token found"})
    }
}