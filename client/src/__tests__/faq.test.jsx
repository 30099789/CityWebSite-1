// src/__tests__/faq.test.jsx
// Unit tests for FAQ page filtering and search logic
// Tests the normalised data structure and filter functions in isolation

import { describe, test, expect } from "vitest";

// Replicate the normalise and filter logic from Faq.jsx
// so we can test it without rendering the full component
function normalise(categories) {
  return categories.map((cat) => {
    const label = cat["@_label"] || cat.label || "General";
    const rawQs = cat.question || cat.questions || [];
    const questions = (Array.isArray(rawQs) ? rawQs : [rawQs]).map((item) => ({
      q: item.q || item.question || "",
      a: item.a || item.answer || "",
    }));
    return { label, questions };
  });
}

function filterCategories(normalised, search, activeTab) {
  return normalised
    .filter((cat) => activeTab === "all" || cat.label === activeTab)
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter((item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);
}

const mockCategories = [
  {
    "@_label": "About the Portal",
    question: [
      { q: "What is CityLink?", a: "A community portal for local services." },
      { q: "Is it free to use?", a: "Yes, completely free." },
    ],
  },
  {
    "@_label": "Events and Bookings",
    question: [
      { q: "How do I book an event?", a: "Go to the Events page and click Book My Spot." },
      { q: "Can I cancel my booking?", a: "Yes, from your profile page." },
    ],
  },
];

describe("FAQ normalise function", () => {

  test("extracts label from @_label attribute", () => {
    const result = normalise(mockCategories);
    expect(result[0].label).toBe("About the Portal");
    expect(result[1].label).toBe("Events and Bookings");
  });

  test("extracts questions and answers correctly", () => {
    const result = normalise(mockCategories);
    expect(result[0].questions[0].q).toBe("What is CityLink?");
    expect(result[0].questions[0].a).toBe("A community portal for local services.");
  });

  test("falls back to label key if @_label missing", () => {
    const cats = [{ label: "My Category", questions: [{ q: "Q", a: "A" }] }];
    const result = normalise(cats);
    expect(result[0].label).toBe("My Category");
  });

  test("handles single question (not array) correctly", () => {
    const cats = [{ "@_label": "Test", question: { q: "Single Q", a: "Single A" } }];
    const result = normalise(cats);
    expect(result[0].questions.length).toBe(1);
    expect(result[0].questions[0].q).toBe("Single Q");
  });
});

describe("FAQ filter function", () => {

  const normalised = normalise(mockCategories);

  test("returns all categories when search is empty and tab is all", () => {
    const result = filterCategories(normalised, "", "all");
    expect(result.length).toBe(2);
  });

  test("filters by active tab", () => {
    const result = filterCategories(normalised, "", "About the Portal");
    expect(result.length).toBe(1);
    expect(result[0].label).toBe("About the Portal");
  });

  test("search filters questions by question text", () => {
    const result = filterCategories(normalised, "book", "all");
    expect(result.length).toBe(1);
    expect(result[0].label).toBe("Events and Bookings");
    expect(result[0].questions.length).toBe(2); // "book an event" and "cancel my booking"
  });

  test("search filters questions by answer text", () => {
    const result = filterCategories(normalised, "profile page", "all");
    expect(result.length).toBe(1);
    expect(result[0].questions[0].q).toBe("Can I cancel my booking?");
  });

  test("search is case-insensitive", () => {
    const result = filterCategories(normalised, "CITYLINK", "all");
    expect(result.length).toBe(1);
    expect(result[0].questions[0].q).toBe("What is CityLink?");
  });

  test("returns empty array when no matches found", () => {
    const result = filterCategories(normalised, "zzznomatch", "all");
    expect(result.length).toBe(0);
  });

  test("hides categories with no matching questions", () => {
    const result = filterCategories(normalised, "event", "all");
    // Only Events and Bookings category should show
    expect(result.every((cat) => cat.label === "Events and Bookings")).toBe(true);
  });

  test("totalResults counts all matching questions across categories", () => {
    const result = filterCategories(normalised, "", "all");
    const total = result.reduce((acc, cat) => acc + cat.questions.length, 0);
    expect(total).toBe(4);
  });
});