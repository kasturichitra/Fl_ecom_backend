import express from "express";
import { getAllNotificationController, markNotificationAsReadController } from "./notificationController.js";


const route = express.Router();



route.get("/", getAllNotificationController);
route.put("/", markNotificationAsReadController);

export default route;

