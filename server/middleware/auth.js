// middleware/auth.js — JWT authentication middleware
// Verifies Bearer token on protected routes
// Usage: router.get("/", protect, handler)
//        router.get("/", protect, requireAdmin, handler)

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "citylink_jwt_secret_2026";

// ── Verify token ───────────────────────────────────────────────────────────────
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorised — no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch {
    return res.status(401).json({ message: "Not authorised — invalid or expired token" });
  }
}

// ── Require admin or staff ─────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "staff")) {
    return res.status(403).json({ message: "Forbidden — admin or staff access required" });
  }
  next();
}

// ── Require admin only (no staff) ─────────────────────────────────────────────
function requireAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden — admin access required" });
  }
  next();
}

// ── Generate token ─────────────────────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { protect, requireAdmin, requireAdminOnly, generateToken };