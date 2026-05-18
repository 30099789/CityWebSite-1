const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");
require("dotenv").config();

const sanitize              = require("./middleware/sanitize");
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


const app = express();

app.use(cors());
app.use(express.json());
app.use(sanitize);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images",  express.static(path.join(__dirname, "../client/public/images")));


app.use("/api/upload",           uploadRouter);
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

app.get("/", (req, res) => res.send("CityLink backend is running"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

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