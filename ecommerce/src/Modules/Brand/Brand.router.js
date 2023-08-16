import {Router} from 'express';
import fileUpload, { fileValidation } from '../../Services/multerCloudinary.js';
import validation from '../../Middleware/validation.js';
import * as brandController from './Controller/Brand.controller.js';
import * as validators from './Brand.validation.js';

import { auth } from '../../Middleware/auth.middleware.js';
import { endPoint } from './Brand.endpoint.js';

const router= Router();
router.get('/:categoryId',validation(validators.getAllBrands),brandController.getAllBrands);

router.post('/',auth(endPoint.create) ,fileUpload(fileValidation.image).single('image'), 
validation(validators.createBrand),
brandController.createBrand);

router.put('/update/:categoryId',auth(endPoint.update) ,fileUpload(fileValidation.image).single("image"),
validation(validators.updateBrand),brandController.updateBrand);

router.put('/updateBrand/:brandId',auth(endPoint.update),
fileUpload(fileValidation.image).single('image'),validation(validators.updateBrand),brandController.updateBrand);
export default router;