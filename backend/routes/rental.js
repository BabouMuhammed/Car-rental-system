const express=require('express')
const router=express.Router()
const {createRental,getAllRentals,getRentalById,getRentalByUserId,acceptRental,rejectRental}=require('../controller/rental')
const authMiddleWare=require('../middleware/authMiddleWare')
router.post('/',authMiddleWare,createRental)
router.get('/',getAllRentals)
router.get('/:id',getRentalById)
router.get('/user/:userId',getRentalByUserId)
router.put('/accept/:id',authMiddleWare,acceptRental)
router.put('/reject/:id',authMiddleWare,rejectRental)

module.exports=router