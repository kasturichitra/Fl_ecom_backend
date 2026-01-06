import { Router } from "express";
import {
  assignTicketController,
  createTicketController,
  getAllTicketsController,
  getTicketByIdController,
  resolveTicketController,
} from "./ticketController.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

router.post("/", verifyToken, createTicketController);

router.get("/admin", verifyToken, getAllTicketsController);
router.get("/admin/:id", verifyToken, getTicketByIdController);

router.put("/assign/:id", verifyToken, assignTicketController);
router.put("/resolve/:id", verifyToken, resolveTicketController);

export default router;
