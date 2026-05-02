// xmlService.js — Sprint 3 Week 10
// Fetches and parses XML config files from /public/xml/ using fast-xml-parser
// XML files: menu.xml, faq.xml, announcements.xml, settings.xml
// Assessment requirement: XML-based configurations for menus, FAQs, app settings

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes:   false,
  attributeNamePrefix: "@_",
  isArray: (name) =>
    ["item", "faq", "announcement", "category", "question", "section"].includes(name),
});

// ── Core fetch helper ──────────────────────────────────────────────────────────
export async function fetchXML(filename) {
  try {
    const res = await fetch(`/xml/${filename}`);
    if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
    const text = await res.text();
    return parser.parse(text);
  } catch (err) {
    console.warn(`[xmlService] ${filename}:`, err.message);
    return null;
  }
}

// ── Menu (navbar + footer links) ───────────────────────────────────────────────
// Used by MainLayout.jsx to drive navigation from XML
export async function getMenuConfig() {
  const data = await fetchXML("menu.xml");
  return data?.menu ?? null;
}

// ── FAQ categories ────────────────────────────────────────────────────────────
// Returns: [{ "@_id", "@_label", question: [{ "@_id", q, a }] }]
// Used by Faq.jsx
export async function getFaqData() {
  const data = await fetchXML("faq.xml");
  return data?.faq?.category ?? [];
}

// ── Announcements ─────────────────────────────────────────────────────────────
// Returns normalised array of announcements from XML
// Used by Announcements.jsx as primary source (DB is fallback)
export async function getAnnouncementsXML() {
  const data = await fetchXML("announcements.xml");
  const raw  = data?.announcements?.item ?? [];
  const items = Array.isArray(raw) ? raw : [raw];

  return items.map((a) => ({
    id:       a["@_id"] || a.id || String(Math.random()),
    title:    a.title    || "",
    summary:  a.summary  || "",
    content:  a.content  || "",
    priority: a.priority || "low",
    date:     a.date     || "",
    category: a.category || "",
    audience: a.audience || "All",
    author:   a.author   || "",
    status:   a.status   || "published",
  }));
}

// ── App-wide settings ─────────────────────────────────────────────────────────
// Returns the full settings object from settings.xml
// Used by useSettings hook → consumed by MainLayout, Home, etc.
// Assessment requirement: App-wide settings stored in XML, read on page load
export async function getSettings() {
  const data = await fetchXML("settings.xml");
  if (!data?.settings) return null;

  const s = data.settings;
  return {
    site: {
      name:         s.site?.name         || "CityLink Initiatives",
      tagline:      s.site?.tagline      || "Smart Community Portal",
      description:  s.site?.description  || "",
      logo:         s.site?.logo         || "CL",
      contactEmail: s.site?.contactEmail || "",
      contactPhone: s.site?.contactPhone || "",
      address:      s.site?.address      || "",
    },
    footer: {
      acknowledgement: s.footer?.acknowledgement || "",
      copyright:       s.footer?.copyright       || "",
    },
    features: {
      bookingsEnabled:     s.features?.bookingsEnabled     !== "false",
      feedbackEnabled:     s.features?.feedbackEnabled     !== "false",
      chatbotEnabled:      s.features?.chatbotEnabled      === "true",
      maintenanceMode:     s.features?.maintenanceMode     === "true",
      maintenanceMessage:  s.features?.maintenanceMessage  || "",
    },
    banner: {
      active:  s.banner?.active === "true",
      message: s.banner?.message || "",
      type:    s.banner?.type    || "info",
    },
  };
}