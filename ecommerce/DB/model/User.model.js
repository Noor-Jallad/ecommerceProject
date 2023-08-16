import mongoose, {Schema,model} from 'mongoose';
const userSchema = new Schema ({
    userName:{
        type:String,
        required:[true,'User name is required'],
        min:[2],
        max:[20]
},
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    confirmEmail:{
        type:Boolean,
        default:false,
    },
    image:{
        type:Object,
    },
    phone:String,
    role:{type:String,
    enum:['User','Admin'],
    default:'User'
    },
    status:{
        type:String,
        default:'Active',
        enum:['Active','Not_Active']
    },
    gender:{
        type:String,
        enum:['Male','Female']

    },
    address:{
        type:String
    },
    forgetCode:{
        type:String,
        default:null
    },
    changePasswordTime:{
        type:Date
    }
},
{ timestamps:true
})
const userModel = mongoose.models.User ||  model('User', userSchema);
export default userModel;


