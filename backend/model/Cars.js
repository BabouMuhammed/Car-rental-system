const mongoose=require('mongoose')

const carsSchema=new mongoose.Schema({
    brand:{
        type:String, 
        required:true

    },
    model:{
        type:String,
        required:true
    },
    price_per_day:{
        type:Number,
        required:true
    },
    fuel_type:{
        type:String,
        enum:['DIESEL','GASOIL'],
    },
    Status:{
        type:String,
        enum:['AVAILABLE','NOT_AVAILABLE'],
    },
    seating_capacity:{
        type:Number,
        required:true,
    },
    image_url:{
        type:String,
        required:true
    }

})
const Car=mongoose.model('Car',carsSchema)
module.exports=Car

