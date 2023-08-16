import {Router} from 'express';
import * as orderController from './Controller/Order.controller.js';

import { auth } from '../../Middleware/auth.middleware.js';
import { endPoint } from './Order.endpoint.js';
const router= Router();
router.post('/',auth(endPoint.create), orderController.createOrder);
router.post('/allItemFromCart',auth(endPoint.create), orderController.createOrderWithAllCartItems);
router.patch('/cancel/:orderId',auth(endPoint.cancel),orderController.cancelOrder);
router.patch('/update/:orderId',auth(endPoint.update),orderController.updateOrderStatusFromAdmin);
export default router;