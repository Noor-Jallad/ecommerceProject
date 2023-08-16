import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../Services/errorHandling.js";
import { verifyToken } from "../Services/generateAndVerifyToken.js";
export const roles ={
    Admin: 'Admin',
    User: 'User' }
export const auth=(accessRoles=[])=>{
    return asyncHandler(async(req,res,next)=>{
      const {authorization}= req.headers;
      if(!authorization?.startsWith(process.env.BEARERKEY))
      {
         return next(new Error(`Invalid Bearer Token`,{cause:400}));
      }
      const token = authorization.split(process.env.BEARERKEY)[1];
    //   return res.json({token});
      if(!token){
        return next(new Error(`Invalid Token`,{cause:400}));
      }
      const decoded= verifyToken(token,process.env.LOGIN_TOKEN);
    //   return res.json({decoded});
      if(!decoded)
      {
        return next(new Error(`Invalid Token Payload`,{cause:400}));
      }
      const user = await userModel.findById(decoded.id).select(`userName role email changePasswordTime`);
      if(!user)
      {
        return next(new Error(`User is not registered!!`,{cause:401}));
      }
      // return console.log(parseInt(user.changePasswordTime.getTime()/1000),decoded.iat);
      if(!accessRoles.includes(user.role)){
        return next(new Error(`User is not autherized to enter!!`,{cause:403}));
      } 
      if(parseInt(user.changePasswordTime?.getTime()/1000)>decoded.iat){
        return next(new Error(`Expired token`,{cause:400}));
      }
       req.user= user;
      return next();
    })
}



