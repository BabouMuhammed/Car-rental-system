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
        
        // Ensure role is set to CUSTOMER by default for new registrations
        const userData = { ...req.body, role: 'CUSTOMER' };
        const user=new User(userData)
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
        const token=await generateToken(userExist._id)

        // Remove password from user object
        const user = userExist.toObject();
        delete user.password;

        return res.status(200).json(
            {
                message:"login successful",
                token:token,
                user: user
            }
        )
            
    
    }catch(error){
        return res.status(500).json({
            message: "login failed",
            error: error.message
        })

    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };
        // Prevent non-admins from changing roles
        if (req.user.role !== 'ADMIN') {
            delete updateData.role;
        }
        
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports={loginUser,registerUser,getUserById,updateUser,getAllUsers}

