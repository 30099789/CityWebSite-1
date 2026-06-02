// server.js -- Sprint 3
// Main entry point for the CityLink backend
// Sets up Express, connects to MongoDB, and registers all API routes
// Deployed on Render -- environment variables set in Render dashboard

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");
require("dotenv").config();

// Middleware
const sanitize = require("./middleware/sanitize");

// Route modules -- each file handles one collection or feature
const servicesRouter        = require("./routes/servicesRouter");
const announcementsRouter   = require("./routes/announcementsRouter");
const eventRoutes           = require("./routes/eventRoutes");
const userRoutes            = require("./routes/userRoutes");
const bookingsRouter        = require("./routes/bookingsRouter");
const serviceRequestsRouter = require("./routes/serviceRequestsRouter");
const xmlRouter             = require("./routes/xmlRouter");
const feedbackRouter        = require("./routes/feedbackRouter");
const contactRouter         = require("./routes/contactRouter");
const chatRouter            = require("./routes/chatRouter");
const uploadRouter          = require("./routes/uploadRouter");
const faqRouter             = require("./routes/faqRouter");

const app = express();
app.disable("x-powered-by");

// Allow requests from the Vercel frontend
const allowedOrigins = [
  "https://city-web-site.vercel.app",
  "http://localhost:5173",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
}));

// Parse JSON bodies -- limit raised to 10mb to support Base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Upload route must be registered BEFORE the sanitize middleware
// sanitize strips "data:" prefixes which breaks Base64 image strings
app.use("/api/upload", uploadRouter);

// Sanitize all other request bodies -- removes potentially harmful characters
app.use(sanitize);

// Serve uploaded files and public images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images",  express.static(path.join(__dirname, "../client/public/images")));

// API routes -- each path maps to its router file
app.use("/api/services",         servicesRouter);
app.use("/api/announcements",    announcementsRouter);
app.use("/api/events",           eventRoutes);
app.use("/api/users",            userRoutes);
app.use("/api/bookings",         bookingsRouter);
app.use("/api/service-requests", serviceRequestsRouter);
app.use("/api/xml",              xmlRouter);
app.use("/api/feedback",         feedbackRouter);
app.use("/api/contact",          contactRouter);
app.use("/api/chat",             chatRouter);
app.use("/api/faqs",             faqRouter);

// Root health check -- confirms the backend is running
app.get("/", (req, res) => res.send("CityLink backend is running"));

// Global error handler -- catches unhandled errors from any route
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Connect to MongoDB then start the server
// MONGO_URI is set as an environment variable in Render
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/citylink")
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });