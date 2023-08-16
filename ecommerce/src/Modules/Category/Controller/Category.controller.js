import categoryModel from '../../../../DB/model/Category.model.js';
import cloudinary from './../../../Services/cloudinary.js';
import slugify from 'slugify';
import { asyncHandler } from './../../../Services/errorHandling.js';
export const createCategory=asyncHandler(async(req,res,next)=>{
const {name}= req.body;
// res.json(name);
if(await categoryModel.findOne({name})){
    return next(new Error("Duplacate category name",{cause:409}));
}
const {secure_url, public_id}= await cloudinary.uploader.upload(req.file.path,
    {folder:`${process.env.app_name}/category`});
// return res.json({secure_url, public_id});
const category=await categoryModel.create({name,slug:slugify(name),image:{secure_url,public_id},
createdBy:req.user._id, updatedBy:req.user._id});
return res.status(201).json({message:"Success",category});
})

export const updateCategory=asyncHandler(async(req,res,next)=>{
    const category = await categoryModel.findById(req.params.categoryId);
    if(!category){
    return next(new Error("Invalid category id",{cause:404}));
    }
    if(req.body.name){
        if(category.name==req.body.name){
            return next(new Error("Old name matches the new name",{cause:409}));
          }
        if(await categoryModel.findOne({name:req.body.name})){
          return next(new Error("Duplicate Category name",{cause:409}));
        }
        category.name =req.body.name;
        category.slug= slugify(req.body.name);
    }
    if(req.file){
        const {secure_url, public_id}= await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.app_name}/category`});
        await cloudinary.uploader.destroy(category.image.public_id);
        category.image = {secure_url, public_id};
    }
    category.updatedBy = req.user._id;
    await category.save();
    return res.json({message:"Success",category});
})
export const getCategory=asyncHandler(async(req,res,next)=>{
 const category=await categoryModel.findById(req.params.categoryId);
 
 return res.json({message:"Success",category});
})
export const getCategories=asyncHandler(async(req,res,next)=>{
    const categories = await categoryModel.find({}).populate('SubCategory');
    return res.json({message:"Success",categories});
})
export const getProducts= asyncHandler(async(req,res,next)=>{
    const {categoryId}= req.params;
    const products = await categoryModel.findById(categoryId).populate({
        path:'Product',
        match:{isDeleted:{$eq:false}}
       });
    return res.status(200).json({message:"Success",products});
})