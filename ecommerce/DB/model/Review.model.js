import mongoose, {Schema,Types,model} from 'mongoose';
const reviewSchema = new Schema ({
   comment:{type:String, required:true},
   rating:{
    type:Number,required:true,min:1,max:5
   },
   productId:{
    type:Types.ObjectId, required:true, ref:'Product'
   },
   orderId:{
    type:Types.ObjectId, required:true, ref:'Order'
   },
   createdBy:{type:Types.ObjectId, required:true, ref:'User'}
},
{ timestamps:true
})
const reviewModel = mongoose.models.Review ||  model('Review', reviewSchema);
export default reviewModel;


