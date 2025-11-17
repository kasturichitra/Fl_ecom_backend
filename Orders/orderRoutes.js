import express from 'express';
import { createOrderController, getOrderSearchController, updateOrderController, getAllUserOrdersController } from './orderController.js';

const route = express.Router();

route.post("/creat", createOrderController)
route.get("/userOrders/:id", getAllUserOrdersController)
route.get("/search", getOrderSearchController)
route.put("/update/:id", updateOrderController)

export default route