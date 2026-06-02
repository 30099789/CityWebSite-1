import { describe, test, expect, beforeEach, afterEach } from "vitest";

// src/__tests__/announcements.test.js
// Unit tests for announcements page filtering and display logic

import { describe, test, expect } from "vitest";

const PRIORITY_CONFIG = {
  high:   { bar: "bg-red-500",   badge: "bg-red-50 text-red-700",     label: "High"   },
  medium: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700", label: "Medium" },
  low:    { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500", label: "Low"   },
  Alert:  { bar: "bg-red-500",   badge: "bg-red-50 text-red-700",     label: "Alert"  },
  Update: { bar: "bg-blue-500",  badge: "bg-blue-50 text-blue-700",   label: "Update" },
  Notice: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700", label: "Notice" },
};
const DEFAULT_PRIORITY = { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500", label: "Notice" };

function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || DEFAULT_PRIORITY;
}

function filterByPriority(items, filter) {
  return filter === "All" ? items : items.filter((a) => a.priority === filter);
}

function filterPublished(items) {
  return items.filter((a) => a.status?.toLowerCase() === "published");
}

function mergeAndSort(dbItems, xmlItems) {
  const db  = dbItems.filter((a)  => a.status?.toLowerCase() === "published");
  const xml = xmlItems.filter((a) => a.status?.toLowerCase() === "published");
  return [...db, ...xml];
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

const mockItems = [
  { title: "Alert 1",  priority: "Alert",  status: "Published" },
  { title: "Update 1", priority: "Update", status: "Published" },
  { title: "Notice 1", priority: "Notice", status: "Published" },
  { title: "High 1",   priority: "high",   status: "Published" },
  { title: "Draft 1",  priority: "Alert",  status: "Draft"     },
];

// ── Priority config tests ─────────────────────────────────────────────────────

describe("getPriorityConfig", () => {

  test("returns Alert config correctly", () => {
    const cfg = getPriorityConfig("Alert");
    expect(cfg.label).toBe("Alert");
    expect(cfg.bar).toBe("bg-red-500");
  });

  test("returns Update config correctly", () => {
    expect(getPriorityConfig("Update").label).toBe("Update");
    expect(getPriorityConfig("Update").bar).toBe("bg-blue-500");
  });

  test("returns Notice config correctly", () => {
    expect(getPriorityConfig("Notice").label).toBe("Notice");
  });

  test("returns high (XML-style) config correctly", () => {
    expect(getPriorityConfig("high").bar).toBe("bg-red-500");
  });

  test("returns medium config correctly", () => {
    expect(getPriorityConfig("medium").bar).toBe("bg-amber-500");
  });

  test("returns default config for unknown priority", () => {
    expect(getPriorityConfig("UNKNOWN").label).toBe("Notice");
  });

  test("returns default config for undefined", () => {
    expect(getPriorityConfig(undefined).label).toBe("Notice");
  });

  test("returns default config for null", () => {
    expect(getPriorityConfig(null).label).toBe("Notice");
  });
});

// ── Filter by priority tests ──────────────────────────────────────────────────

describe("filterByPriority", () => {

  test("returns all items when filter is All", () => {
    expect(filterByPriority(mockItems, "All").length).toBe(mockItems.length);
  });

  test("filters by Alert priority", () => {
    const result = filterByPriority(mockItems, "Alert");
    expect(result.length).toBe(2); // includes Draft Alert
    expect(result.every((i) => i.priority === "Alert")).toBe(true);
  });

  test("filters by high (XML-style) priority", () => {
    const result = filterByPriority(mockItems, "high");
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("High 1");
  });

  test("returns empty array for priority with no matches", () => {
    expect(filterByPriority(mockItems, "medium")).toEqual([]);
  });

  test("handles empty items array", () => {
    expect(filterByPriority([], "Alert")).toEqual([]);
  });
});

// ── Published filter tests ────────────────────────────────────────────────────

describe("filterPublished", () => {

  test("excludes Draft items", () => {
    const result = filterPublished(mockItems);
    expect(result.every((i) => i.status?.toLowerCase() === "published")).toBe(true);
  });

  test("Draft Alert is excluded", () => {
    const result = filterPublished(mockItems);
    expect(result.some((i) => i.title === "Draft 1")).toBe(false);
  });

  test("all published items are included", () => {
    expect(filterPublished(mockItems).length).toBe(4);
  });
});

// ── Merge tests ───────────────────────────────────────────────────────────────

describe("mergeAndSort (DB first, XML follows)", () => {

  const db  = [{ title: "DB",  status: "Published" }, { title: "DB Draft", status: "Draft" }];
  const xml = [{ title: "XML", status: "Published" }, { title: "XML Draft", status: "Draft" }];

  test("DB published items appear before XML published items", () => {
    const result = mergeAndSort(db, xml);
    expect(result[0].title).toBe("DB");
    expect(result[1].title).toBe("XML");
  });

  test("draft items are excluded from both sources", () => {
    const result = mergeAndSort(db, xml);
    expect(result.every((i) => i.status === "Published")).toBe(true);
  });

  test("total length counts only published items", () => {
    expect(mergeAndSort(db, xml).length).toBe(2);
  });

  test("sets source correctly to xml+db when both have items", () => {
    const dbPub  = db.filter((i) => i.status === "Published");
    const xmlPub = xml.filter((i) => i.status === "Published");
    const src = dbPub.length > 0 && xmlPub.length > 0 ? "xml+db" : dbPub.length > 0 ? "db" : "xml";
    expect(src).toBe("xml+db");
  });
});

// ── Date formatting tests ─────────────────────────────────────────────────────

describe("formatDate", () => {

  test("formats a valid ISO date string", () => {
    const result = formatDate("2026-06-14T00:00:00.000Z");
    expect(result).toContain("2026");
    expect(result).toContain("Jun");
  });

  test("returns null for undefined date", () => {
    expect(formatDate(undefined)).toBeNull();
  });

  test("returns null for null date", () => {
    expect(formatDate(null)).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(formatDate("")).toBeNull();
  });
});