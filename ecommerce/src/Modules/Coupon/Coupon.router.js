import {Router} from 'express';
import fileUpload, { fileValidation } from '../../Services/multerCloudinary.js';
import validation from '../../Middleware/validation.js';
import * as validators from './Coupon.validation.js';
import * as couponController from './Controller/Coupon.controller.js';
import { endPoint } from './Coupon.endpoint.js';
import { auth } from '../../Middleware/auth.middleware.js';
const router= Router();

router.get('/',couponController.getCoupons);

router.get('/:couponId',validation(validators.getSpecificCoupon),couponController.getSpecificCoupon);

router.post('/',auth(endPoint.create) ,fileUpload(fileValidation.image).single('image'),
validation(validators.createCoupon),
couponController.createCoupon);

router.put('/update/:couponId',auth(endPoint.update), fileUpload(fileValidation.image).single('image'),
validation(validators.updateCoupon),
couponController.updateCoupon);

export default router;