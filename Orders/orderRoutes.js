import express from "express";
import {
  createOrderController,
  getOrderSearchController,
  updateOrderController,
  getAllUserOrdersController,
} from "./orderController.js";

const route = express.Router();

route.post("/", createOrderController);
route.get("/userOrders/:id", getAllUserOrdersController);
route.get("/search", getOrderSearchController);
route.put("/:id", updateOrderController);

export default route;
