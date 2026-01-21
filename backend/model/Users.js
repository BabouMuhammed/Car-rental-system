const mongoose=require('mongoose')

const usersSchema=new mongoose.Schema({

   
    
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },

    phone:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['ADMIN','CUSTOMER'],
        default:'CUSTOMER',
        required:true
    }
})

const User=mongoose.model('User',usersSchema)
module.exports=User