

import express from 'express'
import verifyToken from '../utils/verifyToken.js'
import { createTicketController, getTicketController, updateTicketController } from './ticketController.js'

const route = express.Router()


route.post("/ticketCreate", createTicketController)
route.get("/tickets", getTicketController)
route.put("/updateTicket/:id", updateTicketController);

export default route