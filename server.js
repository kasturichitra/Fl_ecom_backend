import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { port_number } from "./env.js";
import compression from "compression";
// import chatSocket from "./utils/chatSocket.js";
// Routes
import authRoutes from "./Auth/authRoute.js";
import userRoutes from "./Users/userRoute.js";
import industryType from "./IndustryType/industryTypeRoutes.js";
import categoryRoutes from "./Category/categoryRoutes.js";
import productRoutes from "./Products/productRoutes.js";
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
import saleTrendRoutes from "./SaleTrend/saleTrendRoutes.js";
import verifyToken from "./utils/verifyToken.js";
import contactInfoRoute from "./ContactInfo/contactInfoRoute.js";
import couponRoute from "./Coupons/couponRoute.js";
import invoiceRoute from "./Invoice/OrderInvoice/invoiceRoute.js";
import faqRoutes from "./FAQ/faqRoutes.js";
import ticketRoutes from "./Tickets/ticketRoutes.js";
import paymentRoutes from "./Payment/paymentRoutes.js";
import businessRoutes from "./Business/businessRoute.js";
import permissionRoutes from "./Permission/permissionRoute.js";
import roleRoutes from "./Role/roleRoute.js";
import ecomFeaturesRoutes from "./EcomFeatures/ecomFeatureRoutes.js";

// Cron Jobs
import "./CronJobs/reviewsCronSchedule.js";
import "./CronJobs/SaleTrandsCornJobs/saleTrendSchedule.js";
import "./CronJobs/CouponsCron/couponsCronSchedule.js";
import "./CronJobs/BusinessCron/businessTaxSchedule.js";

import morgan from "morgan";
import accessLogStream from "./utils/buildLogStream.js";

const app = express();

/* --------------------- Express Middleware --------------------- */
app.use(compression());
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://10.1.1.15:5173",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://10.1.1.120:5173",
      "http://10.1.1.120:5174",
    ],
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
morgan.token("body", (req) => {
  const clone = { ...req.body };
  if (clone.image_base64) clone.image_base64 = "[BASE64_REMOVED]";
  if (clone.product_image) clone.product_image = "[BASE64_REMOVED]";
  if (clone.product_images) clone.product_images = "[BASE64_REMOVED]";
  if (clone.image) clone.image = "[BASE64_REMOVED]";
  return JSON.stringify(clone);
});
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

app.use("/auth", authRoutes);
app.use("/industryType", industryType);
app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/reviews", productsReviewsRoute);
app.use(
  "/orders",
  // verifyToken,
  orderRoute
);
// app.use("/ticket",verifyToken, ticketRoute);
app.use("/wishlists", verifyToken, wishlistRoute);
app.use("/banners", bannerRoutes);
app.use("/brands", brandRoutes);
app.use(
  "/cart",
  // verifyToken,
  cartRoutes
);
app.use("/notifications", verifyToken, notificationRoutes);
app.use("/configs", configRoutes);
app.use(
  "/dashboard",
  // verifyToken,
  dashboardRoutes
);
app.use("/saleTrends", saleTrendRoutes);

app.use("/contactInfo", contactInfoRoute);
app.use("/coupons", couponRoute);
app.use("/invoices", invoiceRoute);
app.use("/faq", faqRoutes);
app.use("/tickets", ticketRoutes);
app.use("/payment", paymentRoutes);
app.use("/business", businessRoutes);
app.use("/permissions", permissionRoutes);
app.use("/role", roleRoutes);
app.use("/ecom-features", ecomFeaturesRoutes);

app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running with Socket.IO support");
});

/* --------------------------- Start Server --------------------------- */

server.listen(port_number, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port_number}`);
});
