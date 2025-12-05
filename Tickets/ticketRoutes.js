import express from "express";
import {
    createTicketController,
    getAllTicketsController,
    getTicketByIdController,
    updateTicketController,
    addMessageController
} from "./ticketController.js";

const route = express.Router();

route.post("/", createTicketController);
route.get("/", getAllTicketsController);
route.get("/:id", getTicketByIdController);
route.put("/:id", updateTicketController);
route.post("/message/:id", addMessageController);

export default route;
