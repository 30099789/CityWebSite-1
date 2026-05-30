// src/__tests__/xmlService.test.js
// Unit tests for XML parsing utility functions
// Tests the sanitise functions that convert XML strings to typed objects

import { describe, test, expect } from "vitest";

// Replicate sanitise functions from XmlManager.jsx for isolated testing
function sanitiseAnnouncement(item) {
  return {
    title:    (item.title    || "").trim() || "Untitled",
    summary:  (item.summary  || "").trim() || "No summary provided",
    content:  (item.content  || item.summary || "").trim() || "No content provided",
    date:     item.date      || new Date().toISOString(),
    category: (item.category || "").trim() || "General",
    audience: (item.audience || "").trim() || "All Residents",
    author:   (item.author   || "").trim() || "Admin",
    priority: ["Notice", "Update", "Alert"].includes(item.priority) ? item.priority : "Notice",
    status:   ["Draft", "Published", "Scheduled", "Archived"].includes(item.status) ? item.status : "Draft",
  };
}

function sanitiseEvent(item) {
  return {
    title:       (item.title       || "").trim() || "Untitled Event",
    description: (item.description || "").trim() || "No description provided",
    date:        item.date         || new Date().toISOString(),
    time:        (item.time        || "").trim() || "TBA",
    location:    (item.location    || "").trim() || "TBA",
    category:    (item.category    || "").trim() || "General",
    status:      (item.status      || "").trim() || "Upcoming",
    image:       (item.image       || "").trim(),
  };
}

function sanitiseService(item) {
  const rawPhone = (item["contact.phone"] || item.phone || "0800000000").replace(/\D/g, "");
  const phone    = rawPhone.length === 10 ? rawPhone : "0800000000";
  const email    = (item["contact.email"] || item.email || "admin@citylink.gov").trim();
  return {
    title:       (item.title       || "").trim() || "Untitled Service",
    description: (item.description || "").trim() || "No description provided",
    category:    (item.category    || "").trim() || "General",
    imageUrl:    (item.imageUrl    || "").trim(),
    contact:     { phone, email },
  };
}

function sanitiseFaq(item) {
  return {
    category:  (item.category || "General").trim(),
    question:  (item.question || "").trim(),
    answer:    (item.answer   || "").trim(),
    sortOrder: parseInt(item.sortOrder) || 0,
  };
}

// ── Announcement sanitiser tests ──────────────────────────────────────────────

describe("sanitiseAnnouncement", () => {

  test("passes through valid data unchanged", () => {
    const result = sanitiseAnnouncement({
      title: "Council Update", summary: "Summary text", content: "Full content",
      category: "General", audience: "All Residents", author: "Admin",
      priority: "Alert", status: "Published", date: "2026-06-01",
    });
    expect(result.title).toBe("Council Update");
    expect(result.priority).toBe("Alert");
    expect(result.status).toBe("Published");
  });

  test("fills in defaults for missing fields", () => {
    const result = sanitiseAnnouncement({});
    expect(result.title).toBe("Untitled");
    expect(result.summary).toBe("No summary provided");
    expect(result.category).toBe("General");
    expect(result.audience).toBe("All Residents");
    expect(result.author).toBe("Admin");
    expect(result.priority).toBe("Notice");
    expect(result.status).toBe("Draft");
  });

  test("rejects invalid priority and falls back to Notice", () => {
    const result = sanitiseAnnouncement({ priority: "URGENT" });
    expect(result.priority).toBe("Notice");
  });

  test("rejects invalid status and falls back to Draft", () => {
    const result = sanitiseAnnouncement({ status: "Active" });
    expect(result.status).toBe("Draft");
  });

  test("accepts all valid priority values", () => {
    for (const p of ["Notice", "Update", "Alert"]) {
      expect(sanitiseAnnouncement({ priority: p }).priority).toBe(p);
    }
  });
});

// ── Event sanitiser tests ─────────────────────────────────────────────────────

describe("sanitiseEvent", () => {

  test("passes through valid data", () => {
    const result = sanitiseEvent({
      title: "Clean-up Day", description: "Join us", date: "2026-08-01",
      time: "09:00 AM", location: "Perth CBD", category: "Community", status: "Upcoming",
    });
    expect(result.title).toBe("Clean-up Day");
    expect(result.location).toBe("Perth CBD");
  });

  test("fills in defaults for missing fields", () => {
    const result = sanitiseEvent({});
    expect(result.title).toBe("Untitled Event");
    expect(result.description).toBe("No description provided");
    expect(result.time).toBe("TBA");
    expect(result.location).toBe("TBA");
    expect(result.category).toBe("General");
    expect(result.status).toBe("Upcoming");
  });

  test("trims whitespace from string fields", () => {
    const result = sanitiseEvent({ title: "  Padded Title  ", location: "  Perth  " });
    expect(result.title).toBe("Padded Title");
    expect(result.location).toBe("Perth");
  });
});

// ── Service sanitiser tests ───────────────────────────────────────────────────

describe("sanitiseService", () => {

  test("passes through valid contact details", () => {
    const result = sanitiseService({
      title: "Waste Management", description: "Weekly pickup",
      category: "Waste", "contact.phone": "0890000001", "contact.email": "waste@city.gov",
    });
    expect(result.contact.phone).toBe("0890000001");
    expect(result.contact.email).toBe("waste@city.gov");
  });

  test("strips non-digit characters from phone number", () => {
    const result = sanitiseService({ "contact.phone": "089 000 0001" });
    expect(result.contact.phone).toBe("0890000001");
  });

  test("falls back to default phone if number is not 10 digits", () => {
    const result = sanitiseService({ "contact.phone": "12345" });
    expect(result.contact.phone).toBe("0800000000");
  });

  test("falls back to default phone if phone is missing", () => {
    const result = sanitiseService({});
    expect(result.contact.phone).toBe("0800000000");
  });

  test("falls back to default email if email is missing", () => {
    const result = sanitiseService({});
    expect(result.contact.email).toBe("admin@citylink.gov");
  });

  test("reads phone from item.phone if contact.phone missing", () => {
    const result = sanitiseService({ phone: "0812345678" });
    expect(result.contact.phone).toBe("0812345678");
  });
});

// ── FAQ sanitiser tests ───────────────────────────────────────────────────────

describe("sanitiseFaq", () => {

  test("passes through valid FAQ data", () => {
    const result = sanitiseFaq({
      category: "About the Portal", question: "What is CityLink?",
      answer: "A community portal.", sortOrder: 0,
    });
    expect(result.category).toBe("About the Portal");
    expect(result.question).toBe("What is CityLink?");
    expect(result.answer).toBe("A community portal.");
    expect(result.sortOrder).toBe(0);
  });

  test("falls back to General category if missing", () => {
    const result = sanitiseFaq({ question: "Q", answer: "A" });
    expect(result.category).toBe("General");
  });

  test("defaults sortOrder to 0 if not a number", () => {
    const result = sanitiseFaq({ category: "Test", question: "Q", answer: "A", sortOrder: "abc" });
    expect(result.sortOrder).toBe(0);
  });

  test("trims whitespace from all string fields", () => {
    const result = sanitiseFaq({
      category: "  About  ", question: "  Q  ", answer: "  A  ",
    });
    expect(result.category).toBe("About");
    expect(result.question).toBe("Q");
    expect(result.answer).toBe("A");
  });
});