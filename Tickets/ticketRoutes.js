import { Router } from "express";
import { createTicketController, getAllTicketsController } from "./ticketController.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

router.post("/", verifyToken, createTicketController);
router.get("/admin", verifyToken, getAllTicketsController);

export default router;
