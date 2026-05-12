// seedAdminUser.js
// Run once from the server folder to set up admin credentials:
// node seedAdminUser.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {

  // Admin account
  const adminHash = await bcrypt.hash("admin123", 10);
  await User.updateOne(
    { email: "admin@email.com" },
    { $set: { email: "admin@citylink.gov", password: adminHash, role: "admin" } }
  );
  console.log("✓ Admin ready:  admin@citylink.gov / admin123");

  // Staff account
  const staffHash = await bcrypt.hash("staff123", 10);
  await User.updateOne(
    { email: "carol@email.com" },
    { $set: { email: "staff@citylink.gov", password: staffHash, role: "staff" } }
  );
  console.log("✓ Staff ready:  staff@citylink.gov / staff123");

  mongoose.disconnect();
  console.log("Done.");
});