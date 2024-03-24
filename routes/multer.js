const multer= require("multer")
const {v4: uuidv4}=require("uuid")
const path =require("path")
// console.log(path.extname("mohit.text"))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      const unique= uuidv4();
      cb(null, unique + path.extname(file.originalname))
    }
  })

  
  const upload = multer({ 
    storage: storage,
    fileFilter:function(req ,file,cb){
      const filetype = ['image/jpeg', 'image/png', 'video/mp4'];
      if(filetype.includes(file.mimetype)){
        cb(null,true)
      }else{
        cb(null,false)
        cb(new Error(' only this type is allow image/jpeg image/png video/mp4'))
      }
    }
  })
  module.exports= upload;