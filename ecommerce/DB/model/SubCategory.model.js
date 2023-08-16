import mongoose, {Schema,model,Types} from 'mongoose';
const subCategorySchema= new Schema({
 name:{
    type:String,
    required:true,
    unique:true },
slug:{
    type:String,
    required:true},
image:{
    type:Object,
    required:true},
    createdBy:{
        type:Types.ObjectId,
        ref:'User',
        required: true
    },
    updatedBy:{
        type:Types.ObjectId,
        ref:'User',
        required: true
    },
categoryId:{
    type: Types.ObjectId,
    ref:'Category',
    required:true}
},{
toJSON:{virtuals:true},
toObject:{virtuals:true},
timestamps:true

})
subCategorySchema.virtual('products',{
    foreignField:'subCategoryId',
    localField:'_id',
    ref:'Product'
})
const subCategoryModel = mongoose.models.SubCategory || model('SubCategory', subCategorySchema);
export default subCategoryModel;