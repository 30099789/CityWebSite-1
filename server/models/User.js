// models/User.js -- Sprint 3
// Stores registered user accounts for the CityLink portal
// Passwords are hashed with bcrypt before saving -- never stored as plain text
// role controls what the user can access: resident, staff or admin

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
    },
    email: {
      type:     String,
      required: true,
      unique:   true, // no two accounts can share the same email
    },
    // Role determines access level throughout the portal
    // resident: public portal only
    // staff: read/write access to admin portal
    // admin: full access including user management
    role: {
      type:    String,
      enum:    ["admin", "staff", "resident"],
      default: "resident",
    },
    // Password is hashed with bcrypt in userRoutes.js before being saved here
    password: {
      type:    String,
      default: "123456",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);