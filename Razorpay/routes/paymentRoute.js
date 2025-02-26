import express from 'express';
import { renderProductPage, createOrder } from '../controllers/paymentController.js';

const paymentRoute = express.Router();

// Routes
paymentRoute.get('/', renderProductPage);
paymentRoute.post('/createOrder', createOrder);

export default paymentRoute;
