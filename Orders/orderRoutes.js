import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  updateOrderController,
  getAllUserOrdersController,
} from "./orderController.js";

const route = express.Router();

route.post("/", createOrderController);
route.get("/userOrders/:id", getAllUserOrdersController);
route.get("/search", getAllOrdersController);
route.put("/:id", updateOrderController);

export default route;
