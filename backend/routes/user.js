const express=require('express')
const router=express.Router()
const {loginUser,registerUser,getUserById,updateUser,getAllUsers}=require('../controller/user')
const authMiddleWare = require('../middleware/authMiddleWare')
const adminMiddleWare = require('../middleware/roleMiddleWare')

router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/', authMiddleWare, adminMiddleWare, getAllUsers)
router.get('/:id', authMiddleWare, getUserById)
router.put('/:id', authMiddleWare, updateUser)

module.exports=router
