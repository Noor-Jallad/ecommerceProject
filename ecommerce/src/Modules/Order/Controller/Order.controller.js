import couponModel from "../../../../DB/model/Coupon.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import productModel from "../../../../DB/model/Product.model.js";
import orderModel from './../../../../DB/model/Order.model.js';
import moment from "moment";
import cartModel from "../../../../DB/model/Cart.model.js";
import createInvoice from "../../../Services/pdf.js";
import { sendEmail } from "../../../Services/sendEmail.js";
export const createOrder= asyncHandler(async(req,res,next)=>{
    const {address,phoneNumber,products,paymentType,couponName}= req.body;
    if(couponName)
    { const coupon = await couponModel.findOne({name:couponName});
        if(!coupon) {
            return next(new Error(`Invalid Coupon Name ${couponName}`,{cause:400})); }
        let now= moment();
        let parsed= moment(coupon.expiredDate,"DD/MM/YYYY");
        let diff = now.diff(parsed,'days');
        if(diff >= 0) {
            return next(new Error(`Coupon Is Expired!!`,{cause:400}));}
        if(coupon.usedBy.includes(req.user._id)){
            return next(new Error(`Coupon is already used by ${req.user._id}`,{cause:400}));
        }
       req.body.coupon= coupon; }
    let subTotal=0;
    let productIds=[];
    let finalProductList=[];
    for(const product of products){
        const checkProduct = await productModel.findOne({
            _id:product.productId,
            stock:{$gte: product.qty},
            isDeleted:false
        })
      if(!checkProduct){
        return next(new Error(`Invalid Product`,{cause:400}));
      }
      product.name = checkProduct.name;
      product.unitPrice = checkProduct.finalPrice;
      product.finalPrice= product.qty * checkProduct.finalPrice;
      subTotal += product.finalPrice;
      productIds.push(product.productId);
      finalProductList.push(product);
    }
    let finalPrice = subTotal - (subTotal*((req.body.coupon?.amount | 0)/100));
    const order = await orderModel.create({
        userId:req.user._id, address, phoneNumber,
        products:finalProductList,
        subTotal,
        couponId:req.body.coupon?._id,
        paymentType,finalPrice,
        status: (paymentType=='card')?'approved':'pending',
        updatedBy:req.user._id
    })
    for(const product of products){
     await productModel.updateOne({_id:product.productId},{$inc:{stock:-product.qty}});
    }
    if(req.body.coupon){
        await couponModel.updateOne({_id:req.body.coupon._id},{$addToSet:{usedBy:req.user._id}});
    }
    await cartModel.updateOne({userId:req.user._id},{
        $pull:
        {products:{
            productId: {$in:productIds}
        }}  })
        const invoice = {
            shipping: {
              name: req.user.userName,
              address,
              city: "Nablus",
              state:'West Bank',
              country:'Palestine'
            },
            items: order.products,
            subTotal,
            TOTAL: order.finalPrice,
            invoice_nr: order._id
          };
          
          createInvoice(invoice, "invoice.pdf");

          await sendEmail(req.user.email,'Anghami Invoice','Welcome',{
            path:'invoice.pdf',
            contentType:'application/pdf'
          });

    return res.status(201).json({message:"Success",order});
})

export const createOrderWithAllCartItems= asyncHandler(async(req,res,next)=>{
    const {address,phoneNumber,paymentType,couponName}= req.body;
    const cart= await cartModel.findOne({userId:req.user._id});
    if(!cart?.product?.length){
      return next(new Error(`Empty Cart!!`));
    }
    req.body.products = cart.product;
    if(couponName)
    { const coupon = await couponModel.findOne({name:couponName});
        if(!coupon) {
            return next(new Error(`Invalid Coupon Name ${couponName}`,{cause:400})); }
        let now= moment();
        let parsed= moment(coupon.expiredDate,"DD/MM/YYYY");
        let diff = now.diff(parsed,'days');
        if(diff >= 0) {
            return next(new Error(`Coupon Is Expired!!`,{cause:400}));}
        if(coupon.usedBy.includes(req.user._id)){
            return next(new Error(`Coupon is already used by ${req.user._id}`,{cause:400})); }
       req.body.coupon= coupon;}
    let subTotal=0;
    let finalProductList=[];
    const productIds=[];
    for(let product of req.body.products){
        const checkProduct = await productModel.findOne({
            _id:product.productId,
            stock:{$gte: product.qty},
            isDeleted:false
        })
      if(!checkProduct){
        return next(new Error(`Invalid Product`,{cause:400}));
      }
      product = product.toObject();
      product.name = checkProduct.name;
      product.unitPrice = checkProduct.finalPrice;
      product.finalPrice= product.qty * checkProduct.finalPrice;
      subTotal += product.finalPrice;
      productIds.push(product.productId);
      finalProductList.push(product);
    }
    let finalPrice = subTotal - (subTotal*((req.body.coupon?.amount | 0)/100));
    const order = await orderModel.create({
        userId:req.user._id, address, phoneNumber,
        products:finalProductList,subTotal,
        couponId:req.body.coupon?._id,paymentType,finalPrice,
        status: (paymentType=='card')?'approved':'pending',
        updatedBy:req.user._id
    })
    for(const product of req.body.products){
     await productModel.updateOne({_id:product.productId},{$inc:{stock:-product.qty}});
    }
    if(req.body.coupon){
        await couponModel.updateOne({_id:req.body.coupon._id},{$addToSet:{usedBy:req.user._id}});
    }
    await cartModel.updateOne({userId:req.user._id},{product:[]});

    const invoice = {
        shipping: {
          name: req.user.userName,
          address,
          city: "Nablus",
          state: "West Bank",
          country: "Palestine",
        },
        items: order.products,
        subTotal,
        TOTAL: order.finalPrice,
        invoice_nr: order._id
      };
      
      createInvoice(invoice, "invoice.pdf");
      
      await sendEmail(req.user.email,'Anghami Invoice','Welcome',{
        path:'invoice.pdf',
        contentType:'application/pdf'
      });
    return res.status(201).json({message:"Success",order});
})

export const cancelOrder= asyncHandler(async(req,res,next)=>{
    const {orderId}= req.params;
    const {reasonReject} = req.body;
    // return res.json(orderId);
    const order= await orderModel.findOne({_id:orderId,userId:req.user._id});
    if(!order || order.status!='pending' || order.paymentType!='cash')
    {  return next(new Error(`Can't Cancel the order`,{cause:400})); }
    const orderCanceled= await orderModel.updateOne({_id:order._id},
        {status:'canceled',reasonReject, updatedBy:req.user._id});
    for(const product of order.products){
        await productModel.updateOne({_id:product.productId},{$inc:{stock:product.qty}}); }
    if(order.couponId){
       await couponModel.updateOne({_id:order.couponId},{ $pull:{usedBy:req.user._id} }) }
       return res.json({message:"Success",orderCanceled}); })
export const updateOrderStatusFromAdmin= asyncHandler(async(req,res,next)=>{
    const {orderId}= req.params;
    const {status}= req.body;
    const order = await orderModel.findOne({_id:orderId});
    if(!order || order.status =='delivered'){
        return next(new Error(`Can't Change The Status Of This Order Or Order Status Is 
        ${order.status}`, {cause:400}));}
   const orderStatusUpdated= await orderModel.updateOne({_id:orderId}, {status, updatedBy:req.user._id});
   if(!orderStatusUpdated.matchedCount){
    return next(new Error(`Failed To Update The Status Of The Order!!`,{cause:400}));}
   return res.status(200).json({message:"Success",orderStatusUpdated});})