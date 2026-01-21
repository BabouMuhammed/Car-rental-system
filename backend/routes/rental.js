const express=require('express')
const router=express.Router()
const {createRental,getAllRentals,getRentalById,getRentalByUserId,acceptRental,rejectRental}=require('../controller/rental')
const authMiddleWare=require('../middleware/authMiddleWare')
const adminMiddleWare=require('../middleware/roleMiddleWare')

router.post('/',authMiddleWare,createRental)
router.get('/',authMiddleWare,getAllRentals)
router.get('/:id',authMiddleWare,getRentalById)
router.get('/user/:userId',authMiddleWare,getRentalByUserId)
router.put('/accept/:id',authMiddleWare,adminMiddleWare,acceptRental)
router.put('/reject/:id',authMiddleWare,adminMiddleWare,rejectRental)

module.exports=router