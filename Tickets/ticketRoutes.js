import express from "express";
import { createTicketController, getAllTicketsController, updateTicketController } from "./ticketController.js";

const route = express.Router();

route.post("/", createTicketController);
route.get("/", getAllTicketsController);
route.put("/:id", updateTicketController);

export default route;
