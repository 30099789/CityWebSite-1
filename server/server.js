const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ROUTES
const servicesRouter = require("./routes/servicesRouter");
const announcementsRouter = require("./routes/announcementsRouter");
// (add events router later if needed)
// const eventsRouter = require("./routes/eventsRouter");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/services", servicesRouter);
app.use("/api/announcements", announcementsRouter);
// app.use("/api/events", eventsRouter);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("CityWebSite backend is running");
});

// DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("Database connection failed:", error.message);
  });

// SERVER START
const PORT = process.env.PORT || 5000;

console.log("Services route loaded at /api/services");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});