const express=require('express');
const path=require('path');
const dotenv=require('dotenv')
const multer=require('multer');
const cloudinary=require('cloudinary')
const app=express();
dotenv.config();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.listen(3000,()=>console.log(`app listern at port 3000`));

const storage=multer.diskStorage({
    filename:function(req,file,cb){
cb(null,file.fieldname+"-"+Date.now());
    },
});

cloudinary.v2.config({
    cloud_name:'your cloudinary_name',
	api_key:'your cloudinary_api key',
	api_secret:'your cloudianary_api_secret',
});
const checkFileType=(file,cb)=>{
    const fileType=/jpg|jpeg|png/;
    const ext=fileType.test(
        path.extname(file.originalname).toLocaleLowerCase()
    );
    const mimetype = fileType.test(file.mimetype);
    if (ext && mimetype) {
		return cb(null, true);
	} else {
		return cb("upload image only");
	}
}
const upload=multer({storage,fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
},
});

app.post('/img/upload',upload.array('images',6),async(req,res)=>{
try {
    let imageFiles=req.files;
    if(!imageFiles) return res.send({
        code:400,
        message:"no images attached!!"
    });

let multipleImages=imageFiles.map(photo=>cloudinary.v2.uploader.upload(photo.path))

let response=await Promise.all(multipleImages);
const newarray=response.map(x=>x.secure_url)
return res.send({
    status:201,
     message:newarray
})
} 
catch (error) {
    res.send({
        code:404,
       message:error.message
    })
}
})