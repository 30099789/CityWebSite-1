// routes/userRoutes.js — Sprint 3 (JWT auth)
const express  = require("express");
const bcrypt   = require("bcryptjs");
const router   = express.Router();
const User     = require("../models/User");
const { protect, requireAdmin, requireAdminOnly, generateToken } = require("../middleware/auth");

// POST /api/users/register
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

// POST /api/users/login
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

// GET all users — admin/staff only
router.get("/", protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// PUT update user — admin only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const update = { ...rest };
    if (password) update.password = await bcrypt.hash(password, 10);
    const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: "-password" });
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE user — admin only
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