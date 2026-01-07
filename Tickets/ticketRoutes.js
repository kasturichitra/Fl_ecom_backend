import { Router } from "express";
import {
  assignTicketController,
  createTicketController,
  getAllTicketsController,
  getTicketByIdController,
  getUserTicketForOrderController,
  resolveTicketController,
} from "./ticketController.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

router.post("/", verifyToken, createTicketController);

router.get("/admin", verifyToken, getAllTicketsController);
router.get("/admin/:id", verifyToken, getTicketByIdController);

router.get("/user/:id", verifyToken, getUserTicketForOrderController);

router.put("/assign/:id", verifyToken, assignTicketController);
router.put("/resolve/:id", verifyToken, resolveTicketController);

export default router;
