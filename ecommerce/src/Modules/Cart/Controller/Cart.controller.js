import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import cartModel from './../../../../DB/model/Cart.model.js';

export const createCart=asyncHandler(async(req,res,next)=>{
// return res.json("hello");
const {productId,qty}=req.body;
const product = await productModel.findById(productId);
if(!product){
    return next(new Error(`Product is not found!!`,{cause:400}));
}
if(product.stock < qty)
{
    return next(new Error(`There's Non Enough Quantity`,{cause:400}));
}
const cart= await cartModel.findOne({userId:req.user._id});
if(!cart){
    const newCart= await cartModel.create({
        userId: req.user._id,
        product:[{productId,qty}]
    });
    
    return res.status(200).json({message:"Success",newCart});
}
let matchProduct = false;
for(let i=0;i<cart.product.length;i++){
 if(cart.product[i].productId.toString() == productId){
    cart.product[i].qty = qty;
    matchProduct= true;
    break;
 }
 if(!matchProduct){
    cart.product.push({productId,qty});
 } }
await cart.save();
return res.json({message:"Success",cart});})

export const clearCart=asyncHandler(async(req,res,next)=>{
    const cart = await cartModel.updateOne({userId:req.user._id},{product:[]},{new:true});
    return res.status(200).json({message:"Success",cart});
})
export const deleteItemFromCart = asyncHandler(async(req,res,next)=>{
    const {productIds} = req.body;
    const cart= await cartModel.updateOne({userId: req.user._id},{$pull:{
        product:{
            productId: {$in:productIds}
        }
    }});
    if(cart.modifiedCount > 0){
        return res.json({message:"Success",cart});
    }
    return res.status(200).json({message:"invalid productId, enter valid one!!"});
})
export const getCart = asyncHandler(async(req,res,next)=>{
    const cart= await cartModel.findOne({userId: req.user._id});
    return res.status(200).json({message:"Success",cart})
})