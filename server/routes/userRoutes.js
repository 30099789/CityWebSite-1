const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({
      name,
      email,
      role,
      password
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, password },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;