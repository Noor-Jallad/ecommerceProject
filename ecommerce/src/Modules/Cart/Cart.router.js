import {Router} from 'express';
import * as cartController from './Controller/Cart.controller.js';
import { auth } from '../../Middleware/auth.middleware.js';
import { endPoint } from './Cart.endpoint.js';
const router= Router();

router.post('/',auth(endPoint.create),cartController.createCart);
router.patch('/clearCart',auth(endPoint.update),cartController.clearCart);
router.patch('/deleteItem',auth(endPoint.update),cartController.deleteItemFromCart);
router.get('/',auth(endPoint.get),cartController.getCart);
export default router;