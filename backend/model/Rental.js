const mongoose=require ('mongoose')

const rentalsSchema= new mongoose.Schema({
  
     user_id:{
        type:mongoose.Types.ObjectId,
        required:true
    },
        car_id:{
        type:String,
        required:true
    },
        start_date:{
        type:Number,
        required:true
    },
        end_date:{
        type:Number,
        required:true
    },
    total_price:{
        type:Number,
        required:true
    },
     rental_satatus:{
        type:String,
        enum:['ACCEPTED','PENDING','REJECTED'],
        default:'PENDING',
        required:true
    },
     payment_status:{
        type:String,
        enum:['PAID','PENDING','CANCELLED'],
        default:'PENDING',
        required:true
    },
})

const Rental=mongoose.model('Rental',rentalsSchema)
module.exports=Rental