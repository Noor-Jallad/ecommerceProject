import { asyncHandler } from "../../../Services/errorHandling.js";
import brandModel from '../../../../DB/model/Brand.js';
import cloudinary from '../../../Services/cloudinary.js';
import slugify from "slugify";

export const getAllBrands= asyncHandler(async(req,res,next)=>{
    const {categoryId}=req.params;
    const brands = await brandModel.find({categoryId});
    return res.status(200).json({message:"Success",brands});
})
export const createBrand=asyncHandler(async(req,res,next)=>{
const {name}= req.body;
const {categoryId}=req.body;
if(await brandModel.findOne({name}))
{
 return next(new Error(`Duplicate brand name`,{cause:409}));
}
const {public_id,secure_url}= await cloudinary.uploader.upload(req.file.path , 
    {folder:`${process.env.app_name}/brand`});
const brand = await brandModel.create({name,slug:slugify(name), categoryId, image:{public_id,secure_url}
    ,createdBy: req.user._id, updatedBy: req.user._id});
return res.status(201).json({message:"Success",brand});
})

export const updateBrand = asyncHandler(async(req,res,next)=>{
    const {brandId}= req.params;
    // return res.json(brandId);
    const brand = await brandModel.findById({_id:brandId});
    if(!brand)
    {
        return next(new Error(`Invalid Brand!!`,{cause:400})); }
    if(req.body.name){
        if(brand.name == req.body.name){
            return next(new Error(`Old name matches new name!!`,{cause:400}));
        }
        if(await brandModel.findOne({name:req.body.name})){
            return next(new Error(`Name already exists!!`,{cause:400}));
        }
        brand.name = req.body.name;
        brand.slug= slugify(req.body.name);
    }
    if(req.file){
        const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.app_name}/brand`});
        await cloudinary.uploader.destroy(brand.image.public_id);
        brand.image = {secure_url,public_id};
    }
    brand.createdBy = req.user._id;
    brand.updatedBy = req.user._id;
    await brand.save();
    return res.status(200).json({message:"Success",brand});
})