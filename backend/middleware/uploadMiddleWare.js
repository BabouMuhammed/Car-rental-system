const multer =require('multer')
const storage =multer.memoryStorage()
const upload =multer({
    storage, 
    limits:{
        filesize: 10 * 1024 * 1024
    },
    fileFilter: (req,file,cb)=>{
        const allowedMimes=['image/jpeg','image/png']

        if (allowedMimes.includes(file.mimetype)) {
            cb(null,true)

        }else {
            cb(new Error('this file type is not allowed'))
        }
    }
})
module.exports =uploads