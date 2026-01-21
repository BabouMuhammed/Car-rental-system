const cloudinary=require('../config/cloudinaryConfig')
const streamifier=require ('streamifier')

const uploadToCloudinary =(fileBuffer,folder= 'APP-uploads')=>{
    return new Promise((resolve,reject)=>{
        const stream= cloudinary.uploader.upload_stream({
            folder,
            quality:'auto' 
            ,fetch_format:'auto'
        }
    ,
    (error,result)=>{
        if(result){
            resolve(result)
        }else if(error){
            reject(error)
        }
    }
     
);
 streamifier.createReadStream(fileBuffer).pipe(stream)
    }
  
)

}

module.exports={uploadToCloudinary}