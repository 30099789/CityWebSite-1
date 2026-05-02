const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");
require("dotenv").config();

const servicesRouter        = require("./routes/servicesRouter");
const announcementsRouter   = require("./routes/announcementsRouter");
const eventRoutes           = require("./routes/eventRoutes");
const userRoutes            = require("./routes/userRoutes");
const bookingsRouter        = require("./routes/bookingsRouter");
const serviceRequestsRouter = require("./routes/serviceRequestsRouter");
const xmlRouter             = require("./routes/xmlRouter");
const feedbackRouter        = require("./routes/feedbackRouter");
const contactRouter         = require("./routes/contactRouter");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/services",         servicesRouter);
app.use("/api/announcements",    announcementsRouter);
app.use("/api/events",           eventRoutes);
app.use("/api/users",            userRoutes);
app.use("/api/bookings",         bookingsRouter);
app.use("/api/service-requests", serviceRequestsRouter);
app.use("/api/xml",              xmlRouter);
app.use("/api/feedback",         feedbackRouter);
app.use("/api/contact",          contactRouter);

app.get("/", (req, res) => res.send("CityLink backend is running"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });