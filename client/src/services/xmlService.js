// xmlService.js
// Fetches and parses XML config files from /public/xml/ using fast-xml-parser
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["item", "faq", "announcement", "category"].includes(name),
});

export async function fetchXML(filename) {
  try {
    const res  = await fetch(`/xml/${filename}`);
    if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
    const text = await res.text();
    return parser.parse(text);
  } catch (err) {
    console.error("xmlService error:", err);
    return null;
  }
}

// ── Convenience helpers ────────────────────────────────────────────────────

export async function getMenuConfig() {
  const data = await fetchXML("menu.xml");
  return data?.menu ?? null;
}

export async function getFaqData() {
  const data = await fetchXML("faq.xml");
  // Returns array of { name, faq: [{question, answer}] }
  return data?.faqs?.category ?? [];
}

export async function getAnnouncementsXML() {
  const data = await fetchXML("announcements.xml");
  const items = data?.announcements?.announcement ?? [];
  // Ensure always an array
  return Array.isArray(items) ? items : [items];
}
