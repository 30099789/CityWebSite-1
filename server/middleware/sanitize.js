// middleware/sanitize.js — XSS input sanitization
// Strips <script> tags and dangerous HTML from all incoming request body fields
// Applied globally in server.js before all routes

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function stripScripts(str) {
  if (typeof str !== "string") return str;
  // Remove <script>...</script> blocks
  return str
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    // Remove on* event handlers (onclick, onload etc.)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove data: protocol
    .replace(/data:/gi, "")
    .trim();
}

function sanitizeValue(val) {
  if (typeof val === "string") return stripScripts(val);
  if (Array.isArray(val))     return val.map(sanitizeValue);
  if (val && typeof val === "object") return sanitizeObject(val);
  return val;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    clean[key] = sanitizeValue(val);
  }
  return clean;
}

// Express middleware — sanitizes req.body in place
function sanitize(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

module.exports = sanitize;