import {Router} from 'express';
import * as productController from './Controller/Product.controller.js';
import fileUpload, { fileValidation } from '../../Services/multerCloudinary.js';
import { endPoint } from './Product.endPoint.js';
import { auth } from '../../Middleware/auth.middleware.js';
import reviewRouter from './../Review/Review.router.js';
const router= Router({mergeParams:true});

router.use('/:productId/review', reviewRouter);
router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).fields([
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:5}
]),productController.createProduct);

router.put('/update/:productId/',auth(endPoint.update),
fileUpload(fileValidation.image).fields([
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:5}
]),productController.updateProduct);
router.get('/softDeleted',auth(endPoint.get),productController.getSoftDeleteProduct);
router.get('/',auth(endPoint.get),productController.getProducts);
router.get('/:productId',auth(endPoint.get),productController.getProduct);
router.patch('/softDelete/:productId',auth(endPoint.softDelete), productController.softDelete);
router.patch('/restore/:productId',auth(endPoint.restore),productController.restore);
router.delete('/forceDelete/:productId',auth(endPoint.forceDelete),productController.forceDelete);
export default router;