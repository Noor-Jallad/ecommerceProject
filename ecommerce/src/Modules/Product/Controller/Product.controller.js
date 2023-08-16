import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import cloudinary from "../../../Services/cloudinary.js";
import productModel from "../../../../DB/model/Product.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from './../../../../DB/model/SubCategory.model.js';
export const createProduct=asyncHandler(async(req,res,next)=>{
    const {name, price,discount,categoryId,subCategoryId,brandId}= req.body;
    const checkCategory= await subCategoryModel.find({_id:subCategoryId, categoryId});
    if(!checkCategory) {
        return next(new Error(`Invalid Category or sub category`,{cause:400}));}
    const checkBrand = await brandModel.find({_id:brandId});
    if(!checkBrand){
        return next(new Error(`Invalid Brand`,{cause:400}));}
    req.body.slug=slugify(name);
    req.body.finalPrice = price -(price * ((discount || 0)/100));
    const {secure_url,public_id}=await cloudinary.uploader.upload(req.files.mainImage[0].path,
        {folder:`${process.env.app_name}/product`});
    req.body.mainImage= {secure_url,public_id};
    if(req.files.subImages){
        req.body.subImages=[];
        for(const file of req.files.subImages){
            const {secure_url,public_id}=await cloudinary.uploader.upload(file.path,
                {folder:`${process.env.app_name}/productSubImages`});
            req.body.subImages.push({secure_url,public_id});}}
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;
   const product =await productModel.create(req.body);
   if(!product){
    return next(new Error(`Fail to create product`,{cause:400})); }
   return res.status(201).json({message:"Success",product});})
export const updateProduct= asyncHandler(async(req,res,next)=>{
    const {productId}=req.params;
    const product = await productModel.findById(productId);
    if(!product){
        return next(new Error(`Invalid product id`,{cause:400})); }
    const {categoryId,subCategoryId,brandId,name,price,discount}=req.body;
    if(categoryId && subCategoryId){
        const checkCategory= await subCategoryModel.findOne({_id:subCategoryId, categoryId});
         if(!checkCategory){
            return next(new Error(`Invalid category or subCategory id`,{cause:400}));  
         }else{
            product.subCategoryId = subCategoryId;
            product.categoryId = categoryId;}}
    if(brandId){
     const checkBrand= await brandModel.findById(brandId);
     if(!checkBrand){
        return next(new Error(`Invalid brand id`,{cause:400})); }
     product.brandId = brandId;}
    if(name){
        product.name = name;
        product.slug = slugify(name); }
    if(price){
     product.price=price;
     product.finalPrice = price - (price * (product.discount/100)); }
    if(discount){
     product.discount= discount;
     product.finalPrice = product.price - (product.price * (discount/100));}
    if(price && discount){
     product.price=price;
     product.discount=discount;
     product.finalPrice =price - (price * ((discount||0)/100));}
    if(req.body.colors){
        product.colors= req.body.colors;}
    if(product.sizes){
        product.sizes= req.body.sizes; }
    if(req.body.stock){
     product.stock= req.body.stock;}
    if(req.body.description){
        product.description= req.body.description;}
    if(req.files.mainImage.length){
      const {secure_url,public_id}= await cloudinary.uploader.upload(req.files.mainImage[0].path,
        {folder:`${process.env.app_name}/product`});
      await cloudinary.uploader.destroy(product.mainImage.public_id);
      product.mainImage.secure_url= secure_url;
      product.mainImage.public_id= public_id; }
    if(req.files.subImages.length){
     const subImages=[];
     for(const file of req.files.subImages){
      const {secure_url,public_id}= await cloudinary.uploader.upload(file.path,{folder:`${process.env.app_name}/productSubImages`});
      subImages.push({secure_url,public_id});}
     product.subImages = subImages;}
    product.updatedBy= req.user._id;
    const newProduct= await product.save();
    if(!newProduct){
        return next(new Error(`Update Product Is Failed!!`,{cause:400})); }
    return res.status(200).json({message:"Success",newProduct});
})

export const getProducts = asyncHandler(async(req,res,next)=>{
let {page,size}=req.query;
const skip = (page-1) * size;
if(!page || page<=0){
    page=1;
}
if(!size || size<=0){
    size=3;
}
const exQueryParams = ['page','size','sort','search'];
const filterQuery = {...req.query};
exQueryParams.map(params=>{
    delete filterQuery[params];
});
const query = JSON.parse(JSON.stringify(filterQuery).replace(/(gte|gt|lte|lt|eq|neq|in|nin)/g,
match=>`$${match}`));

const mongoQuery =productModel.find(query).populate('review').limit(size).skip(skip).
sort(req.query.sort?.replaceAll(',',' '));
if(req.query.search){
    const products = await mongoQuery.find({
        $or:[
            {name:{$regex:req.query?.search,$options:'i'}},
            {description:{$regex:req.query?.search,$options:'i'}}
        ]
    })
    req.body.products = products;
}else{
    const products = await mongoQuery
    req.body.products=products;
}
const products = req.body.products;
if(!products){
    return next(new Error(`Product is not found!!`,{cause:400}));
}
return res.status(200).json({message:"Success",products});
})

export const getProduct= asyncHandler(async(req,res,next)=>{
 const {productId}=req.params;
 const product = await productModel.findById(productId).populate('review');
 if(!product){
    return next(new Error(`Product is not found!!`,{cause:400})); }
 return res.status(200).json({message:"Success",product});})

export const softDelete=asyncHandler(async(req,res,next)=>{
    const {productId}= req.params;
    const product = await productModel.findOneAndUpdate({_id:productId,isDeleted:false},
        {isDeleted:true},{new:true});
    if(!product){
        return next(new Error(`Product is not found!!`,{cause:400})); }
    return res.status(200).json({message:"Success",product});
})
export const getSoftDeleteProduct = asyncHandler(async(req,res,next)=>{
  const products = await productModel.find({isDeleted:true});
  return res.status(200).json({message:"Success",products});
})
export const restore= asyncHandler(async(req,res,next)=>{
    // return res.json("Restore");
    const {productId} = req.params;
    const product = await productModel.findOneAndUpdate({_id:productId,isDeleted:true},{isDeleted:false},{new:true});
    if(!product){
        return next(new Error(`Product is not found!!`,{cause:400})); }
    return res.status(200).json({message:"Success",product});})
export const forceDelete = asyncHandler(async(req,res,next)=>{
    const {productId}= req.params;
    const product = await productModel.findOneAndDelete({_id:productId, isDeleted:true},{new:true});
    if(!product){
        return next(new Error(`Product is not found!!`,{cause:400}));}
    return res.status(200).json({message:"Success",product});})