import mongoose, {Schema,model,Types} from 'mongoose';
const cartSchema= new Schema({
 userId: {
    type:Types.ObjectId,required:true,ref:'User'
 },
 product:[{ productId:{
            type:Types.ObjectId,required:true,ref:'Product'
            }, 
             qty:{ type:Number,default:1 }
    }]
},{
timestamps:true
})
const cartModel = mongoose.models.Cart ||  model('Cart', cartSchema);
export default cartModel;