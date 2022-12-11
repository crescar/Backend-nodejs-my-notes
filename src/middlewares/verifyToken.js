const jwt = require('jsonwebtoken')
require('dotenv').config();

const verifyToken = async (token)=>{
    return await jwt.verify(token,process.env.JWT_SECRECT_KEY, (error, data)=>{
        if(error){
            return {
                auth: false
            }
        }
        return {
            auth:true,
            infoUser: data
        }
    } )
}

module.exports = verifyToken;