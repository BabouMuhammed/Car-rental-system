const jwt=require('jsonwebtoken')
const User=require('../model/Users')
const authMiddleWare= async (req,res,next)=>{
    try{
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({message:"No authorization header provided"});
        }
        
        const token=authHeader.replace('Bearer ','')
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.id)
        if(!user){
            return res.status(401).json({message:"User not found or token invalid"})
        }
        req.user=user
        next()
    }   catch(error){
        console.error('Auth middleware error:', error.message);
        res.status(401).json({message:"Unauthorized access"})
    }
}

module.exports=authMiddleWare