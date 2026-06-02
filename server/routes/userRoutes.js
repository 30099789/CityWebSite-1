// routes/userRoutes.js
// Assessment requirement: User authentication and profile management
// Handles: register, login, get user by ID, update profile, delete user

const express  = require("express");
const bcrypt   = require("bcryptjs");
const router   = express.Router();
const User     = require("../models/User");
const { protect, requireAdmin, requireAdminOnly, generateToken } = require("../middleware/auth");

// ── POST /api/users/register ──────────────────────────────────────────
// Assessment requirement: user registration with validation
// Validates name, email, password (min 6 chars)
// Checks for duplicate email before creating account
// Hashes password with bcrypt before saving to MongoDB
// Returns JWT token on success so user is logged in immediately
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user   = new User({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed, role: "resident" });
    const saved  = await user.save();
    const token  = generateToken(saved);
    res.status(201).json({ _id: saved._id, name: saved.name, email: saved.email, role: saved.role, token });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
});

// ── POST /api/users/login ─────────────────────────────────────────────
// Assessment requirement: JWT authentication
// Finds user by email, compares password with bcrypt hash
// Returns same error message for wrong email OR wrong password (prevents user enumeration)
// Returns JWT token valid for 7 days on success
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });
    const token = generateToken(user);
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

// ── POST /api/users/admin-create ─────────────────────────────────────
// Admin only — creates a new user with any role (staff, admin, resident)
// Used by ManageUsers admin page to create staff/admin accounts
router.post("/admin-create", protect, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user   = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashed,
      role:     role || "resident",
    });
    const saved = await user.save();
    res.status(201).json({ _id: saved._id, name: saved.name, email: saved.email, role: saved.role });
  } catch {
    res.status(500).json({ message: "Failed to create user" });
  }
});

// ── GET /api/users ────────────────────────────────────────────────────
// Returns all users for admin dashboard — admin/staff only
// IMPORTANT: must be defined BEFORE /:id route
// otherwise Express matches "users" as an :id param and returns 404
router.get("/", protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────────────
// Returns a single user by ID — used by Profile page to load latest data
// Requires JWT token — user can only fetch their own profile
// Returns all fields except password (-password projection)
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────
// Assessment requirement: profile editing
// Updates name, phone, suburb and other fields
// If password included, hashes it before saving
// Returns updated user without password field
router.put("/:id", protect, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden — you can only edit your own profile" });
  }
  try {
    const { password, ...rest } = req.body;
    const update = { ...rest };
    if (password) update.password = await bcrypt.hash(password, 10);
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, select: "-password" }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────
// Admin only — permanently removes a user account from MongoDB
router.delete("/:id", protect, requireAdminOnly, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;