import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import slugify from 'slugify';
export const createSubCategory=asyncHandler(async(req,res,next)=>{
// return res.json(req.params.categoryId);
const {categoryId}=req.params;
const {name} = req.body;
if(await subCategoryModel.findOne({name})){
    return next(new Error(`Duplicate subcategory name`,{cause:409}));
}
const {secure_url, public_id}= await cloudinary.uploader.upload(req.file.path,
    {folder:`${process.env.app_name}/subCategory`});
// return res.json({secure_url, public_id});
const subCategory=await subCategoryModel.create({name,slug:slugify(name),
    image:{secure_url,public_id},categoryId,createdBy:req.user._id,updatedBy:req.user._id});
return res.status(201).json({message:"Success",subCategory});
})
export const updateSubCategory=asyncHandler(async(req,res,next)=>{
const {categoryId,subCategoryId}=req.params;
const subCategory= await subCategoryModel.findOne({_id:subCategoryId,categoryId});
if(!subCategory)
{  return next(new Error(`Invalid sub category id : ${req.params.subCategoryId}`,{cause:400}));
}
if(req.body.name){
    if(req.body.name == subCategory.name){
        return next(new Error(`Old name matches new name`,{cause:409}));}
    else if(await subCategoryModel.findOne({name:req.body.name})){
    return next(new Error(`Duplicate subcategory name: ${req.body.name}`,{cause:409}));
  }
 subCategory.name = req.body.name;
 subCategory.slug = slugify(req.body.name);
}
if(req.file){
const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,
    {folder:`${process.env.app_name}/subCategory`});
await cloudinary.uploader.destroy(subCategory.image.public_id);
subCategory.image = {secure_url,public_id}; 
}
subCategory.updatedBy = req.user._id;
await subCategory.save();
return res.status(200).json({message:"Success",subCategory});
})
//localost:3000/category/123212..(categoryId)/subCategory/update/12754673(subCategoryId)
export const getSpecificSubCategory=asyncHandler(async(req,res,next)=>{
    const {categoryId}=req.params;
    // return res.json({categoryId});
    const subCategory = await subCategoryModel.find({categoryId});
    return res.status(200).json({message:"Success",subCategory});
})

export const getCategories=asyncHandler(async(req,res,next)=>{
    const categories = await subCategoryModel.find({}).populate({
        path:'categoryId',
        select:'-_id name image'
    });
    return res.status(200).json({message:"Success",categories});
})

export const getProducts= asyncHandler(async(req,res,next)=>{
    // return res.json("Ok");
    const {subCategoryId} = req.params;
    const products = await subCategoryModel.findById(subCategoryId).populate({
        path:'products',
        match:{isDeleted:{$eq:false}},
        populate:{path:'review'}
    });
    return res.status(200).json({message:"Success",products})

})