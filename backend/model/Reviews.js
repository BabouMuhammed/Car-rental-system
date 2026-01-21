const mongoose= require('mongoose')
const User = require('./Users')
const ReviewsSchema=new mongoose.Schema({
    
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true

    },
    car_id:{
        type:mongoose.Types.ObjectId,
        ref:'Car',
        required:true
    },
    rating:{
        type:Number,
        min:1, max:5,
        required:true
    },
    date:{
        type:Number,
        required:true
    }

})

const Review=mongoose.model('Review'.ReviewSchema)

modeule.exports=Review