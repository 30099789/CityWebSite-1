// __tests__/feedback.test.js
// Unit tests for feedback validation logic

function validateFeedback({ category, rating, message }) {
  if (!category || (rating === undefined || rating === null || rating === "") || !message?.trim()) {
    return { valid: false, message: "Category, rating and message are required" };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, message: "Rating must be between 1 and 5" };
  }
  return { valid: true };
}

describe("Feedback validation", () => {

  test("valid feedback passes", () => {
    expect(validateFeedback({ category: "Events", rating: 5, message: "Great!" }).valid).toBe(true);
  });

  test("missing category fails", () => {
    expect(validateFeedback({ rating: 3, message: "OK" }).valid).toBe(false);
  });

  test("missing message fails", () => {
    expect(validateFeedback({ category: "Events", rating: 3 }).valid).toBe(false);
  });

  test("whitespace-only message fails", () => {
    expect(validateFeedback({ category: "Events", rating: 3, message: "   " }).valid).toBe(false);
  });

  test("rating 0 fails", () => {
    const r = validateFeedback({ category: "Events", rating: 0, message: "OK" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/1 and 5/i);
  });

  test("rating 6 fails", () => {
    expect(validateFeedback({ category: "Events", rating: 6, message: "OK" }).valid).toBe(false);
  });

  test("all valid ratings 1-5 pass", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(validateFeedback({ category: "Events", rating, message: "OK" }).valid).toBe(true);
    }
  });

  test("anonymous feedback (no name or email) is allowed", () => {
    // userName and userEmail are optional -- only category, rating, message required
    expect(validateFeedback({ category: "Services", rating: 3, message: "Average" }).valid).toBe(true);
  });
});