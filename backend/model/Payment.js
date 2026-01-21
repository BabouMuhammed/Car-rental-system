const mongoose=require ('mongoose')
const paymentsSchema=new mongoose.Schema({

    user_id:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    payment_mehtod:{
        type:String,
        enum:['CASH','WAVE'],
        required:true

    },
    payment_date:{
        type:Number,
        required:true
    },
    transaction_id:{
        type:Number,
        required:true
    }

})
const Payment=mongoose.model('Payment',PaymentsSchema)
module.exports=Payment