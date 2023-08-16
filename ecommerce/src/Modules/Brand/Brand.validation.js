import joi from 'joi';
import { generalFeilds } from '../../Middleware/validation.js';

export const createBrand = joi.object({
    name: joi.string().min(2).max(20).required(),
    file: generalFeilds.file.required(),
    categoryId: generalFeilds.id
}).required()

export const getAllBrands= joi.object({
    categoryId: generalFeilds.id
}).required()

export const updateBrand = joi.object({
    brandId: generalFeilds.id,
    name: joi.string().min(2).max(20).required(),
    file: generalFeilds.file.required(),
}).required()
