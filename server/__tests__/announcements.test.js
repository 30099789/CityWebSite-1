// __tests__/announcements.test.js
// Unit tests for announcement validation and business logic

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

function filterPublished(items) {
  return items.filter((a) => a.status?.toLowerCase() === "published");
}

function mergeAnnouncements(db, xml) {
  return [...db, ...xml];
}

const PRIORITY_CONFIG = {
  high:   { bar: "bg-red-500",   label: "High"   },
  medium: { bar: "bg-amber-500", label: "Medium" },
  low:    { bar: "bg-slate-300", label: "Low"    },
  Alert:  { bar: "bg-red-500",   label: "Alert"  },
  Update: { bar: "bg-blue-500",  label: "Update" },
  Notice: { bar: "bg-amber-400", label: "Notice" },
};
const DEFAULT_PRIORITY = { bar: "bg-slate-300", label: "Notice" };

function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || DEFAULT_PRIORITY;
}

describe("sanitiseAnnouncement", () => {

  test("passes through valid announcement data unchanged", () => {
    const result = sanitiseAnnouncement({
      title: "Council Update", summary: "Important news", content: "Full content here",
      category: "General", audience: "All Residents", author: "Admin",
      priority: "Alert", status: "Published", date: "2026-06-01",
    });
    expect(result.title).toBe("Council Update");
    expect(result.priority).toBe("Alert");
    expect(result.status).toBe("Published");
    expect(result.author).toBe("Admin");
  });

  test("fills defaults for all missing fields", () => {
    const result = sanitiseAnnouncement({});
    expect(result.title).toBe("Untitled");
    expect(result.summary).toBe("No summary provided");
    expect(result.content).toBe("No content provided");
    expect(result.category).toBe("General");
    expect(result.audience).toBe("All Residents");
    expect(result.author).toBe("Admin");
    expect(result.priority).toBe("Notice");
    expect(result.status).toBe("Draft");
  });

  test("trims whitespace from all string fields", () => {
    const result = sanitiseAnnouncement({
      title: "  Test Title  ", summary: "  Summary  ", author: "  Kate  ",
    });
    expect(result.title).toBe("Test Title");
    expect(result.summary).toBe("Summary");
    expect(result.author).toBe("Kate");
  });

  test("rejects invalid priority and falls back to Notice", () => {
    expect(sanitiseAnnouncement({ priority: "URGENT" }).priority).toBe("Notice");
  });

  test("rejects invalid status and falls back to Draft", () => {
    expect(sanitiseAnnouncement({ status: "Active" }).status).toBe("Draft");
  });

  test("accepts all valid priority values", () => {
    for (const p of ["Notice", "Update", "Alert"]) {
      expect(sanitiseAnnouncement({ priority: p }).priority).toBe(p);
    }
  });

  test("accepts all valid status values", () => {
    for (const s of ["Draft", "Published", "Scheduled", "Archived"]) {
      expect(sanitiseAnnouncement({ status: s }).status).toBe(s);
    }
  });

  test("uses summary as content fallback when content is missing", () => {
    expect(sanitiseAnnouncement({ summary: "This is the summary" }).content).toBe("This is the summary");
  });

  test("whitespace-only title falls back to Untitled", () => {
    expect(sanitiseAnnouncement({ title: "   " }).title).toBe("Untitled");
  });
});

describe("filterPublished", () => {

  const items = [
    { title: "A", status: "Published" },
    { title: "B", status: "Draft" },
    { title: "C", status: "published" },
    { title: "D", status: "Archived" },
    { title: "E", status: "Published" },
  ];

  test("returns only published items", () => {
    expect(filterPublished(items).length).toBe(3);
  });

  test("is case-insensitive for status check", () => {
    expect(filterPublished(items).some((i) => i.title === "C")).toBe(true);
  });

  test("excludes Draft items", () => {
    expect(filterPublished(items).some((i) => i.title === "B")).toBe(false);
  });

  test("excludes Archived items", () => {
    expect(filterPublished(items).some((i) => i.title === "D")).toBe(false);
  });

  test("returns empty array when none are published", () => {
    expect(filterPublished([{ status: "Draft" }, { status: "Archived" }])).toEqual([]);
  });

  test("handles empty input array", () => {
    expect(filterPublished([])).toEqual([]);
  });
});

describe("mergeAnnouncements (DB first, XML follows)", () => {

  const db  = [{ title: "DB item 1" }, { title: "DB item 2" }];
  const xml = [{ title: "XML item 1" }];

  test("DB items appear before XML items", () => {
    const result = mergeAnnouncements(db, xml);
    expect(result[0].title).toBe("DB item 1");
    expect(result[2].title).toBe("XML item 1");
  });

  test("total length is DB + XML", () => {
    expect(mergeAnnouncements(db, xml).length).toBe(3);
  });

  test("handles empty DB -- returns XML only", () => {
    expect(mergeAnnouncements([], xml).length).toBe(1);
  });

  test("handles empty XML -- returns DB only", () => {
    expect(mergeAnnouncements(db, []).length).toBe(2);
  });

  test("handles both empty -- returns empty array", () => {
    expect(mergeAnnouncements([], [])).toEqual([]);
  });
});

describe("getPriorityConfig", () => {

  test("returns correct config for Alert", () => {
    expect(getPriorityConfig("Alert").label).toBe("Alert");
    expect(getPriorityConfig("Alert").bar).toBe("bg-red-500");
  });

  test("returns correct config for Update", () => {
    expect(getPriorityConfig("Update").label).toBe("Update");
  });

  test("returns correct config for XML-style high priority", () => {
    expect(getPriorityConfig("high").bar).toBe("bg-red-500");
  });

  test("returns default config for unknown priority", () => {
    expect(getPriorityConfig("UNKNOWN").label).toBe("Notice");
  });

  test("returns default config for undefined", () => {
    expect(getPriorityConfig(undefined).label).toBe("Notice");
  });
});