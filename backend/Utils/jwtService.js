const jwt =require('jsonwebtoken')
const dotenv=require('dotenv')
dotenv.config();

const generateToken=(email)=>{
    return jwt.sign(
        {
            email:email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_EXPIRATION
        }

    )
}
module.exports={generateToken}