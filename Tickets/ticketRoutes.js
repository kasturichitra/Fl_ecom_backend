import { Router } from "express";
import { assignTicketController, createTicketController, getAllTicketsController } from "./ticketController.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

router.post("/", verifyToken, createTicketController);
router.get("/admin", verifyToken, getAllTicketsController);

router.put("/assign/:id", verifyToken, assignTicketController);

export default router;
