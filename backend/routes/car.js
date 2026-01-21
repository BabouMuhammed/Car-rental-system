const express=require('express')
const router=express.Router()
const {createCar,getAllCars,getCarById,updateCar,deleteCar}=require('../controller/car')
const authMiddleWare=require('../middleware/authMiddleWare')
const multer=require('multer')
const upload=multer()

router.post('/',authMiddleWare,upload.single('image'),createCar)
router.get('/',getAllCars)
router.get('/:id',getCarById)
router.put('/:id',authMiddleWare,updateCar)
router.delete('/:id',authMiddleWare,deleteCar)

module.exports=router


