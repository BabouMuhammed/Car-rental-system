const express=require('express')
const router=express.Router()
const {createCar,getAllCars,getCarById,updateCar,deleteCar}=require('../controller/car')
const authMiddleWare=require('../middleware/authMiddleWare')
const adminMiddleWare=require('../middleware/roleMiddleWare')
const multer=require('multer')
const upload=multer()

router.post('/',authMiddleWare,adminMiddleWare,upload.single('image'),createCar)
router.get('/',getAllCars)
router.get('/:id',getCarById)
router.put('/:id',authMiddleWare,adminMiddleWare,updateCar)
router.delete('/:id',authMiddleWare,adminMiddleWare,deleteCar)

module.exports=router


