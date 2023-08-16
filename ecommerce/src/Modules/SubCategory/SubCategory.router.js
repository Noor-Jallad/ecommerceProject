import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as SubCategoryController from './Controller/SubCategory.controller.js';
import {Router} from 'express';
import validation from './../../Middleware/validation.js';
import * as validators from './SubCategory.validation.js';
import { endPoint } from "./SubCategory.endpoint.js";
import { auth } from "../../Middleware/auth.middleware.js";
const router= Router({mergeParams:true});
router.post('/',auth(endPoint.create) ,fileUpload(fileValidation.image).single('image'),
validation(validators.createSubCategory),
SubCategoryController.createSubCategory);

router.put('/update/:subCategoryId',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),
validation(validators.updateSubCategory),
SubCategoryController.updateSubCategory);
//localhost:3000/category/:categoryId/subCategory/update/:subCategoryId

router.get('/',SubCategoryController.getSpecificSubCategory);
//localhost:3000/category/:categoryId/subCategory/
router.get('/all',SubCategoryController.getCategories);
// localhost:3000/subCategory/all/
router.get('/:subCategoryId/product', SubCategoryController.getProducts);

export default router;


