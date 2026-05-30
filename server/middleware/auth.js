// middleware/auth.js — Sprint 3
// JWT authentication middleware used to protect API routes
// Add "protect" to a route to require login
// Add "requireAdmin" to also require admin or staff role
// Add "requireAdminOnly" to require admin role only (no staff)
//
// Examples:
//   router.get("/", protect, handler)              — logged in users only
//   router.post("/", protect, requireAdmin, handler) — admin or staff only
//   router.delete("/", protect, requireAdminOnly, handler) — admin only

const jwt = require("jsonwebtoken");

// The secret key used to sign and verify tokens
// In production this should be set as an environment variable in Render
const JWT_SECRET = process.env.JWT_SECRET || "citylink_jwt_secret_2026";

// Checks that the request has a valid JWT token in the Authorization header
// If valid, adds the decoded user info (id, email, role, name) to req.user
// Returns 401 if the token is missing or invalid
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

// Checks that the logged-in user is admin or staff
// Must be used after protect (protect sets req.user first)
// Returns 403 if the user is a resident
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "staff")) {
    return res.status(403).json({ message: "Forbidden — admin or staff access required" });
  }
  next();
}

// Stricter version — only allows admin role, not staff
// Used for sensitive actions like deleting users
function requireAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden — admin access required" });
  }
  next();
}

// Creates a JWT token for a user after login or registration
// Token contains the user's id, email, role and name
// Expires after 7 days — user will need to log in again after that
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { protect, requireAdmin, requireAdminOnly, generateToken };