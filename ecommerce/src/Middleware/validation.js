
import joi from 'joi'
import { Schema, Types } from 'mongoose'
// const dataMethods = ['body','query','params','headers','file'];
export const validationObjectId =(value,helper)=>{
    if(Types.ObjectId.isValid(value)){
        return true 
    }else {
        return helper.message("id is invalid");
    }
}
export const generalFeilds = {
    email:joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password:joi.string().min(3).required(),
    file:joi.object({
        fieldname:joi.string().required(),
        originalname:joi.string().required(),
        encoding:joi.string().required(),
        mimetype:joi.string().required(),
        destination:joi.string().required(),
        filename:joi.string().required(),
        path:joi.string().required(),
        size:joi.number().positive().required(),
        dest:joi.string(),
    }),
    // id:joi.string().min(24).max(24).required(),
    id:joi.string().custom(validationObjectId).required(),
}
const validation = (schema)=>{
    return (req,res,next)=>{

    const inputsData={...req.body ,...req.query,...req.params};
    if(req.file){
        inputsData.file= req.file;
    }
    // return res.json(inputsData);
    const validationResult=schema.validate(inputsData);
    if(validationResult.error?.details){
        return res.json({message:"validation Error",validationError:validationResult.error?.details});
    }
    return next();
}
}
export default validation;

