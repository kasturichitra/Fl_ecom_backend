import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  updateOrderController,
  getAllUserOrdersController,
  getOrderProductController,
  getOrderSingleProductController,
} from "./orderController.js";

const route = express.Router();

route.post("/", createOrderController);
// route.get("/userOrders/:id", getAllUserOrdersController);
route.get("/orderProduct", getOrderSingleProductController);
route.get("/search", getAllOrdersController);
route.get("/:id", getOrderProductController);
route.put("/:id", updateOrderController);


export default route;
