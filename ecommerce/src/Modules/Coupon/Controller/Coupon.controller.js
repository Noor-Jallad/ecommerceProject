import { request, response } from "express";
import { asyncHandler } from "../../../Services/errorHandling.js";
import couponModel from './../../../../DB/model/Coupon.model.js';

export const getCoupons=asyncHandler(async(req,res,next)=>{
 const coupons = await couponModel.find({});
 return res.status(200).json({message:"Success",coupons});
})

export const getSpecificCoupon= asyncHandler(async(req,res,next)=>{
const coupon = await couponModel.findOne({_id:req.params.couponId});
return res.status(200).json({message:"Success",coupon});
})

export const createCoupon =asyncHandler(async(req,res,next)=>{
const {name} = req.body;
if(await couponModel.findOne({name})){
 return next(new Error(`Duplicate Coupon Name!!`,{cause:'409'}));
}
let date = new Date(req.body.expiredDate);
let now = new Date();
// console.log(now);
if(now.getTime() >= date.getTime()){
    return next(new Error(`Invalid Date`,{cause:400}));
}
date= date.toLocaleDateString();
req.body.expiredDate = date;
req.body.createdBy= req.user._id;
req.body.updatedBy= req.user._id;
const coupon=await couponModel.create(req.body);
return res.status(201).json({message:"Success",coupon});
})

export const updateCoupon=asyncHandler(async(req,res,next)=>{
    // return res.json("noor");
    const {couponId}= req.params;
    const coupon= await couponModel.findById(couponId);
    if(!coupon){
     return next(new Error(`Invalid Coupon id ${couponId}`,{cause:409}));
    }
    if(req.body.name){
       if(coupon.name == req.body.name){
        return next(new Error(`Old name matches new name`,{cause:409}));
       }
       if(await couponModel.findOne({name:req.body.name})){
        return next(new Error(`Duplicate coupon name ${req.body.name}`,{cause:409}));
       }
       coupon.name = req.body.name;
    }
    if(req.body.amount){
        coupon.amount = req.body.amount;
    }
    coupon.updatedBy= req.user._id;
    await coupon.save();
    return res.status(200).json({message:"Success",coupon});

})