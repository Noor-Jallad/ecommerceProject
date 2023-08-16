import {Router} from 'express';
import * as reviewController from './Controller/Review.controller.js';
import { auth } from '../../Middleware/auth.middleware.js';
import { endPoint } from './Review.endpoint.js';
const router= Router({mergeParams:true});

router.post('/',auth(endPoint.create) ,reviewController.createReview);
router.put('/update/:reviewId',auth(endPoint.update),reviewController.updateReview);

export default router;