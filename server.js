import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { port_number } from "./env.js";
// import chatSocket from "./utils/chatSocket.js";
// Routes
import userRoutes from "./Users/userRoute.js";
import industryType from "./IndustryType/industryTypeRoutes.js";
import categoryRoute from "./Category/categoryRoute.js";
import productRoute from "./Products/productRoutes.js";
import productsReviewsRoute from "./Products/ProductsReviews/productReviewRoutes.js";
import orderRoute from "./Orders/orderRoutes.js";
// import ticketRoute from "./Tickets/ticketRoutes.js";
import wishlistRoute from "./Wishlist/wishlistRoute.js";
import bannerRoutes from "./Banners/bannersRoutes.js";
import brandRoutes from "./Brands/brandRoutes.js";
import cartRoutes from "./Cart/cartRoutes.js";
import notificationRoutes from "./Notification/notificationRoutes.js";
import configRoutes from "./Configs/configRoutes.js";
import dashboardRoutes from "./Dashboard/dashboardRoutes.js";


import morgan from "morgan";
import accessLogStream from "./utils/buildLogStream.js";

const app = express();

/* --------------------- Express Middleware --------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://10.1.1.15:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
    credentials: true,
  })
);

/* ---------------------- HTTP + Socket.IO ---------------------- */

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ["http://10.1.1.15:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});



export const connectedUsers = new Map();

// chatSocket(io);

io.on("connection", (socket) => {
  console.log("✔ Socket connected:", socket.id);

  socket.on("registerUser", (userId, role) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
    }
    if (role === "Admin") {
      socket.join("admins");
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

/* ---------------------- Morgan Logging ---------------------- */

// Create custom tokens
morgan.token("body", (req) => JSON.stringify(req.body));
morgan.token("params", (req) => JSON.stringify(req.params));
morgan.token("query", (req) => JSON.stringify(req.query));

const format = ":date[iso] | :response-time ms | :status | :method :url | params=:params | query=:query | body=:body ";

// Write to rotating file
app.use(morgan(format, { stream: accessLogStream }));

// Also print to console in dev mode
if (process.env.NODE_ENV !== "production") {
  app.use(morgan(format));
}

/* -------------------------- REST API Routes -------------------------- */

app.use("/industryType", industryType);
app.use("/category", categoryRoute);
app.use("/products", productRoute);
app.use("/reviews", productsReviewsRoute);
app.use("/orders", orderRoute);
// app.use("/ticket", ticketRoute);
app.use("/wishlists", wishlistRoute);
app.use("/banners", bannerRoutes);
app.use("/brands", brandRoutes);
app.use("/cart", cartRoutes);
app.use("/notifications", notificationRoutes);
app.use("/configs", configRoutes);
app.use("/dashboard", dashboardRoutes);


app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running with Socket.IO support");
});

/* --------------------------- Start Server --------------------------- */

server.listen(port_number, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port_number}`);
});
