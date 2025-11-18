import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { port_number } from "./env.js";

// Import all routes
// import categoryTypeRoute from "./CategoryTypes/categoryTypeRoute.js";
// import subCategoryRoute from "./SubCategory/subCategoryRoute.js";

import userRoutes from "./Users/userRoute.js";
import industryType from "./IndustryType/industryTypeRoutes.js";
import categoryRoute from "./Category/categoryRoute.js";
import productRoute from "./Products/productRoutes.js";
import productsReviewsRoute from "./Products/ProductsReviews/productReviewRoutes.js";
import orderRoute from "./Orders/orderRoutes.js";
import ticketRoute from "./Tickets/ticketRoutes.js";
import wishlistRoute from "./Wishlist/wishlistRoute.js";
import bannerRoutes from "./Banners/bannersRoutes.js";
import brandRoutes from "./Brands/brandRoutes.js";
import verifyToken from "./utils/verifyToken.js";
const app = express();

//  Express Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://10.1.115:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
    credentials: true,
  })
);

//  HTTP + WebSocket Server Setup

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["http://10.1.115:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//  Socket.IO Connection Handling
export const connectedUsers = new Map();
io.on("connection", (socket) => {
  console.log(":white_check_mark: Socket connected:", socket.id);
  // User registers after login
  socket.on("registerUser", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`:large_green_circle: User ${userId} registered with socket ${socket.id}`);
    }
  });
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`:red_circle: User ${userId} disconnected`);
        break;
      }
    }
  });
});

// REST API Routes
// app.use("/categoryType", categoryTypeRoute);
// app.use("/subCategory", subCategoryRoute);

app.use("/users", userRoutes);
app.use(
  "/industryType",
  //  verifyToken,
  industryType
);
app.use(
  "/category",
  //  verifyToken,
  categoryRoute
);
app.use(
  "/products",
  // verifyToken,
  productRoute
);
app.use(
  "/reviews",
  // verifyToken,
  productsReviewsRoute
);
app.use(
  "/orders",
  // verifyToken,
  orderRoute
);
app.use(
  "/ticket",
  //  verifyToken,
  ticketRoute
);
app.use(
  "/wishlists",
  //  verifyToken,
  wishlistRoute
);
app.use(
  "/banners",
  //  verifyToken,
  bannerRoutes
);
app.use("/brands", verifyToken, brandRoutes);

app.get("/", (req, res) => {
  res.send("Server is running with Socket.IO support");
});

server.listen(port_number, "0.0.0.0", () => {
  console.log(`Server running on port ${port_number}`);
});
