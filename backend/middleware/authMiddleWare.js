const jwt=require('jsonwebtoken')
const User=require('../model/Users')
const authMiddleWare= async (req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.email)
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }
        req.user=user
        next()
    }   catch(error){
        res.status(401).json({message:"Unauthorized"})
    }
}

module.exports=authMiddleWare