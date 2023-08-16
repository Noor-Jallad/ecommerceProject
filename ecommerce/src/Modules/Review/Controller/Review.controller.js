import { asyncHandler } from "../../../Services/errorHandling.js";
import orderModel from './../../../../DB/model/Order.model.js';
import reviewModel from './../../../../DB/model/Review.model.js';

export const createReview = asyncHandler(async(req,res,next)=>{
    // return res.json("Ok");
    const {productId} = req.params;
    const {comment,rating}=req.body;
    const order = await orderModel.findOne({
      userId: req.user._id,
      status:'delivered',
      "products.productId":productId
    })
    if(!order){
        return next(new Error(`Can't Review This Product After Recieving It`,{cause:400}));
    }
    if(await reviewModel.findOne({createdBy:req.user._id,productId})){
     return next(new Error(`Can't Review Again!!`,{cause:400}));
    }
    const review=await reviewModel.create({ comment,rating,createdBy:req.user._id,
        orderId:order._id, productId});
    return res.status(201).json({message:"Success",review});
})

export const updateReview = asyncHandler(async(req,res,next)=>{
    // return res.json("Ok");
    // const {comment,rating}= req.body;
    const {productId, reviewId}=req.params;
    const review = await reviewModel.findOne({_id:reviewId});
    if(!review){
      return next(new Error(`Review Is Not Found!!`,{cause:400}));
    }
    const reviewUpdated=await reviewModel.findOneAndUpdate({_id:reviewId,productId,createdBy:req.user._id},
        req.body,{new:true});
    return res.status(200).json({message:"Success",reviewUpdated});
})