// import { string } from 'joi';
import mongoose, {Schema,model,Types} from 'mongoose';
const productSchema= new Schema({
 name:{
    type:String,
    required:true,
    unique:true,
    trim:true},
slug:{
    type:String,
    required:true},
description:String,
stock:{
    type:Number,
    default:1
},
price:{
    type:Number,
    default:1
},
discount:{
 type:Number,
 default: 0
},
finalPrice:{
type:Number,
default:1
},
sizes:{
    type:String,
    enum:['s','m','lg','xl']
},
mainImage:{
    type:Object,
    required:true},
subImages:{
    type:Object,
    required:true
},
colors:[String],
categoryId:
{ type:Types.ObjectId, ref:'Category', required:true
}, 
subCategoryId:
{
  type:Types.ObjectId, ref:'Category', required:true
},
brandId:{
  type:Types.ObjectId, ref:'Brand', required:true
},
isDeleted:{
    type:Boolean,
    default:false
}
,
createdBy:{
    type:Types.ObjectId, ref:'User', required: true
    },
updatedBy:{
    type:Types.ObjectId, ref:'User', required: true
    },

},{
toJSON:{virtuals:true},
toObject:{virtuals:true},
 timestamps:true
})

productSchema.virtual('review',{
    foreignField:'productId',
    localField:'_id',
    ref:'Review'
})
const productModel = mongoose.models.Product ||  model('Product', productSchema);
export default productModel;