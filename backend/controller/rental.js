const Rental=require('../model/Rental')
const Car=require('../model/Cars')

const createRental= async (req,res)=>{
    try{
      const userId=req.user._id
      const carId=req.body.car_id
      const startDate=req.body.start_date
      const endDate=req.body.end_date
      const car=await Car.findById(carId)
     if(!car){
            return res.status(404).json({message:"Car not found"})
      }
        const oneDay=24*60*60*1000
        const rentalDays=Math.round(Math.abs((new Date(endDate)-new Date(startDate))/oneDay))+1
        const totalPrice=rentalDays*car.price_per_day

        const rental=new Rental({
            user_id:userId,
            car_id:carId,
            start_date:startDate,
            end_date:endDate,
            total_price:totalPrice
        })
        await rental.save()
        res.status(201).json(rental)
    }catch(error){
        res.status(400).json(error)
    }
}

const getAllRentals= async (req,res)=>{
    try{
        let rentals;
        if (req.user.role === 'ADMIN') {
            rentals=await Rental.find().populate('user_id').populate('car_id')
        } else {
            rentals=await Rental.find({user_id: req.user._id}).populate('car_id')
        }
        res.status(200).json(rentals)
    }catch(error){
        res.status(400).json(error)
    }
}
const getRentalById= async (req,res)=>{
    try{
        const rentalId=req.params.id;
        const rental=await Rental.findById(rentalId)
        if(!rental){
            return res.status(404).json({message:"Rental not found"})
        }
        return res.status(200).json(rental)
    }catch(error){
        res.status(400).json(error)
    }
}
const getRentalByUserId= async (req,res)=>{
    try{
        const userId=req.params.userId;
        const rentals=await Rental.find({user_id:userId})
        return res.status(200).json(rentals)
    }catch(error){
        res.status(400).json(error)
    }
}
const acceptRental= async (req,res)=>{
    try{
        const rentalId=req.params.id;
        const updatedRental=await Rental.findByIdAndUpdate(rentalId,{rental_status:'ACCEPTED'},{new:true})
        if(!updatedRental){
            return res.status(404).json({message:"Rental not found"})
        }
        return res.status(200).json(updatedRental)
    }catch(error){
        res.status(400).json(error)
    }   
}
const rejectRental= async (req,res)=>{
    try{
        const rentalId=req.params.id;
        const updatedRental=await Rental.findByIdAndUpdate(rentalId,{rental_status:'REJECTED'},{new:true})
        if(!updatedRental){
            return res.status(404).json({message:"Rental not found"})
        }
        return res.status(200).json(updatedRental)
    }catch(error){
        res.status(400).json(error)
    }
}

module.exports={createRental,getAllRentals,getRentalById,getRentalByUserId,acceptRental,rejectRental}