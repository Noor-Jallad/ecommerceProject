import {Router} from 'express';
import fileUpload, { fileValidation } from '../../Services/multerCloudinary.js';
import * as categoryController from './Controller/Category.controller.js'
import subCategory from './../SubCategory/SubCategory.router.js';
import * as validator from './Category.validation.js';
import validation from './../../Middleware/validation.js';
import { auth, roles } from '../../Middleware/auth.middleware.js';
import { endPoint } from './Category.endpoint.js';
const router= Router();

router.use('/:categoryId/subCategory',subCategory);

router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).single('image'),
validation(validator.createCategory),
categoryController.createCategory);

router.put('/update/:categoryId',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),
validation(validator.updateCategory),
categoryController.updateCategory);

router.get("/:categoryId",auth(Object.values(roles)),validation(validator.getCategory),
categoryController.getCategory);

router.get("/",auth(Object.values(roles)), categoryController.getCategories);

router.get('/:categoryId/product',auth(Object.values(roles)),categoryController.getProducts);

export default router;

