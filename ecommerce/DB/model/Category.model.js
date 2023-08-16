import mongoose,{Schema,model,Types} from 'mongoose';
const categorySchema= new Schema({
 name:{
    type:String,
    required:true,
    unique:true
 },
slug:{
    type:String,
    required:true
},
image:{
    type:Object,
    required:true
},
createdBy:{
    type:Types.ObjectId,
    ref:'User',
    required: true
},
updatedBy:{
    type:Types.ObjectId,
    ref:'User',
    required: true
}
},{ toJSON:{virtuals:true}, toObject:{virtuals:true}, timestamps:true})
categorySchema.virtual('SubCategory',{
localField:'_id',
foreignField:'categoryId',
ref:'SubCategory'})
categorySchema.virtual('Product',{
    localField:'_id',
    foreignField:'categoryId',
    ref:'Product' })
export default categorySchema;