import { Router } from "express";
import { createTicketController } from "./ticketController.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

router.post("/", verifyToken,  createTicketController); 

export default router;