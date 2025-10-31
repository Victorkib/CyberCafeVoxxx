import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
  getCartSummary,
} from '../controllers/cart.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes are protected
router.use(authMiddleware);

router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', addToCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;
