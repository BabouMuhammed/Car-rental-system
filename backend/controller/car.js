const Car=require('../model/Cars')
const {uploadToCloudinary}=require('../Utils/cloudinaryUploader')
const createCar= async (req,res)=> {
    try{
        const file=req.file
        if(!file){
            return res.status(400).json({message:"No file uploaded"})
        }
        const result=await uploadToCloudinary(file.buffer,'car-images')
        req.body.image_url=result.secure_url
        const newCar=new Car(req.body)
        await newCar.save()
        res.status(201).json(newCar)

    }catch(error){
        res.status(400).json(error)

    }
}
const getAllCars= async (req,res)=>{
    try{
        const cars=await Car.find()
        res.status(200).json(cars)
        }
    catch(error){
        res.status(400).json(error)
    }
}

const getCarById= async (req,res)=>{
    try{
        const carId=req.params.id;
        const car=await Car.findById(carId)
        if(!car){
            return res.status(404).json({message:"Car not found"})
        }
        return res.status(200).json(car)
    }catch(error){
        res.status(400).json(error)
    }
}

const updateCar= async (req,res)=>{
    try{
        const carId=req.params.id;
        const updatedCar=await Car.findByIdAndUpdate(carId,req.body,{new:true})
        if(!updatedCar){
            return res.status(404).json({message:"Car not found"})
        }
        return res.status(200).json(updatedCar)
    }catch(error){
        res.status(400).json(error)
    }
}

const deleteCar= async (req,res)=>{
    try{
        const carId=req.params.id;
        const deletedCar=await Car.findByIdAndDelete(carId)
        if(!deletedCar){
            return res.status(404).json({message:"Car not found"})
        }
        return res.status(200).json({message:"Car deleted successfully"})
    }catch(error){
        res.status(400).json(error)
    }
}

module.exports={createCar,getAllCars,getCarById,updateCar,deleteCar}