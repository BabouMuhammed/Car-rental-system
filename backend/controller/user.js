const User=require('../model/Users')
const bcrypt=require('bcrypt') 
const jwt =require('jsonwebtoken')        
const {generateToken}=require('../Utils/jwtService')            

const registerUser= async (req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password
        const userExist =await User.findOne({
            email:email
        })
        
        if (userExist){
            return res.status(400).json(
                {
                    message: "there is already a user with this email"
                }
            )
        }
        if(!password){
            return res.status(400).json(
                {
                    message: "password cannot be empty"
                }
            )
        }

        
        const hashedPassword=await bcrypt.hash(password,10)
        const user=new User(req.body)
        user.password=hashedPassword;
        await user.save()
        res.status(201).json({
            message:"user registered successfully"
        })
    }
    catch(error){
        res.status(400).json(error)

    }

}
const loginUser= async (req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password

        const userExist=await User.findOne({
            email:email

        })
        if(!userExist){
            return res.status(500).json(
                {
                    message:"invalid credentials"
                }
        )}
        const passwordMatches=await bcrypt.compare(password,userExist.password)
        if(!passwordMatches){
           return res.status(400).json(
                {
                    message:"invalid credentails"
                }
            )
        }
        const token=await generateToken(email)

        return res.status(200).json(
            {
                message:"login successful",
                token:token
            }
        )
            
    
    }catch(error){
        return res.status(500).json({
            message: "login failed",
            error: error.message
        })

    }
}
module.exports={loginUser,registerUser}

