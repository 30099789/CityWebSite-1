// routes/xmlRouter.js — Sprint 3 Week 10
// Assessment requirement: Connect XML parsers to front-end content loaders
// Serves parsed XML config files as JSON via API endpoints
// Allows admin tools or external consumers to read XML config server-side

const express  = require("express");
const fs       = require("fs");
const path     = require("path");
const router   = express.Router();
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
  ignoreAttributes:    false,
  attributeNamePrefix: "@_",
});

// Helper: read and parse an XML file from the client/public/xml/ directory
function parseXMLFile(filename) {
  // Look for XML files in the client public folder
  const xmlPath = path.join(__dirname, "../../client/public/xml", filename);
  if (!fs.existsSync(xmlPath)) {
    return null;
  }
  const content = fs.readFileSync(xmlPath, "utf-8");
  return parser.parse(content);
}

// GET /api/xml/menu — returns parsed menu.xml as JSON
router.get("/menu", (req, res) => {
  const data = parseXMLFile("menu.xml");
  if (!data) return res.status(404).json({ message: "menu.xml not found" });
  res.json(data);
});

// GET /api/xml/faq — returns parsed faq.xml as JSON
router.get("/faq", (req, res) => {
  const data = parseXMLFile("faq.xml");
  if (!data) return res.status(404).json({ message: "faq.xml not found" });
  res.json(data);
});

// GET /api/xml/announcements — returns parsed announcements.xml as JSON
router.get("/announcements", (req, res) => {
  const data = parseXMLFile("announcements.xml");
  if (!data) return res.status(404).json({ message: "announcements.xml not found" });
  res.json(data);
});

// GET /api/xml/settings — returns parsed settings.xml as JSON
router.get("/settings", (req, res) => {
  const data = parseXMLFile("settings.xml");
  if (!data) return res.status(404).json({ message: "settings.xml not found" });
  res.json(data);
});

module.exports = router;