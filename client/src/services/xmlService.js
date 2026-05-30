// xmlService.js — Sprint 3 Week 10
// Reads XML config files from the /public/xml/ folder and returns them as JavaScript objects
// This satisfies the assessment requirement for XML-based configuration
// Files used: menu.xml (navigation), faq.xml (FAQ page), announcements.xml, settings.xml

import { XMLParser } from "fast-xml-parser";

// Set up the XML parser
// ignoreAttributes: false means XML attributes like id="1" are kept
// isArray lists tags that should always be treated as arrays even if there is only one item
const parser = new XMLParser({
  ignoreAttributes:    false,
  attributeNamePrefix: "@_",
  isArray: (name) =>
    ["item", "faq", "announcement", "category", "question", "section"].includes(name),
});

// Fetches an XML file from /public/xml/ and parses it into a JavaScript object
// Returns null if the file is missing or fails to load
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

// Returns the menu config from menu.xml
// Used by the navigation component to build links from XML
export async function getMenuConfig() {
  const data = await fetchXML("menu.xml");
  return data?.menu ?? null;
}

// Returns the FAQ categories and questions from faq.xml
// Used by the FAQ page to display accordion questions
// Returns: [{ "@_id", "@_label", question: [{ "@_id", q, a }] }]
export async function getFaqData() {
  const data = await fetchXML("faq.xml");
  return data?.faq?.category ?? [];
}

// Returns announcements from announcements.xml as a clean array
// Used by the public Announcements page — merged with MongoDB announcements
// Each item is normalised so missing fields have safe default values
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

// Returns the site-wide settings from settings.xml
// Used by the useSettings hook which feeds into the layout, home page and footer
// Covers: site name, contact details, feature flags and maintenance mode
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
    // Feature flags — can turn features on/off without touching the code
    features: {
      bookingsEnabled:    s.features?.bookingsEnabled    !== "false",
      feedbackEnabled:    s.features?.feedbackEnabled    !== "false",
      chatbotEnabled:     s.features?.chatbotEnabled     === "true",
      maintenanceMode:    s.features?.maintenanceMode    === "true",
      maintenanceMessage: s.features?.maintenanceMessage || "",
    },
    // Site-wide banner message (e.g. maintenance notice)
    banner: {
      active:  s.banner?.active === "true",
      message: s.banner?.message || "",
      type:    s.banner?.type    || "info",
    },
  };
}