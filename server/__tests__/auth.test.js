// __tests__/auth.test.js
// Unit tests for authentication logic
// Uses Jest mocks -- no database connection required

// Mock mongoose and models before requiring any app code
jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

// ── bcrypt utility tests ──────────────────────────────────────────────────────

describe("Password hashing (bcrypt)", () => {

  test("hashes a password and produces a different string", async () => {
    const password = "mypassword123";
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt hash format
  });

  test("correctly verifies a matching password", async () => {
    const password = "mypassword123";
    const hash = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
  });

  test("rejects an incorrect password", async () => {
    const hash = await bcrypt.hash("correctpassword", 10);
    const match = await bcrypt.compare("wrongpassword", hash);
    expect(match).toBe(false);
  });

  test("two hashes of the same password are different (salt)", async () => {
    const hash1 = await bcrypt.hash("password123", 10);
    const hash2 = await bcrypt.hash("password123", 10);
    expect(hash1).not.toBe(hash2);
    // Both should still verify correctly
    expect(await bcrypt.compare("password123", hash1)).toBe(true);
    expect(await bcrypt.compare("password123", hash2)).toBe(true);
  });

  test("minimum password length check (6 characters)", () => {
    const isValid = (pw) => pw && pw.length >= 6;
    expect(isValid("abc")).toBe(false);
    expect(isValid("abcdef")).toBe(true);
    expect(isValid("longpassword")).toBe(true);
  });
});

// ── JWT utility tests ─────────────────────────────────────────────────────────

describe("JWT token generation and verification", () => {

  const SECRET = "test_secret_key";
  const user = { _id: "507f1f77bcf86cd799439011", email: "test@example.com", role: "resident" };

  function generateToken(u) {
    return jwt.sign({ id: u._id, role: u.role }, SECRET, { expiresIn: "7d" });
  }

  test("generates a token that can be verified", () => {
    const token = generateToken(user);
    const decoded = jwt.verify(token, SECRET);
    expect(decoded.id).toBe(user._id);
    expect(decoded.role).toBe("resident");
  });

  test("token contains role claim", () => {
    const adminUser = { ...user, role: "admin" };
    const token = generateToken(adminUser);
    const decoded = jwt.verify(token, SECRET);
    expect(decoded.role).toBe("admin");
  });

  test("token verification fails with wrong secret", () => {
    const token = generateToken(user);
    expect(() => jwt.verify(token, "wrong_secret")).toThrow();
  });

  test("token verification fails with tampered token", () => {
    const token = generateToken(user) + "tampered";
    expect(() => jwt.verify(token, SECRET)).toThrow();
  });

  test("token expires (short expiry test)", async () => {
    const shortToken = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1ms" });
    await new Promise((r) => setTimeout(r, 10)); // wait 10ms
    expect(() => jwt.verify(shortToken, SECRET)).toThrow(/expired/i);
  });
});

// ── Input validation logic tests ──────────────────────────────────────────────

describe("Registration input validation", () => {

  // Replicate validation logic from userRoutes.js
  function validateRegister({ name, email, password }) {
    if (!name?.trim() || !email?.trim() || !password) {
      return { valid: false, message: "Name, email and password are required" };
    }
    if (password.length < 6) {
      return { valid: false, message: "Password must be at least 6 characters" };
    }
    return { valid: true };
  }

  test("validates correct input", () => {
    const result = validateRegister({ name: "Kate", email: "kate@test.com", password: "password123" });
    expect(result.valid).toBe(true);
  });

  test("rejects missing name", () => {
    const result = validateRegister({ name: "", email: "kate@test.com", password: "password123" });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/required/i);
  });

  test("rejects missing email", () => {
    const result = validateRegister({ name: "Kate", email: "", password: "password123" });
    expect(result.valid).toBe(false);
  });

  test("rejects missing password", () => {
    const result = validateRegister({ name: "Kate", email: "kate@test.com", password: "" });
    expect(result.valid).toBe(false);
  });

  test("rejects password shorter than 6 characters", () => {
    const result = validateRegister({ name: "Kate", email: "kate@test.com", password: "abc" });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/6 characters/i);
  });

  test("accepts password exactly 6 characters", () => {
    const result = validateRegister({ name: "Kate", email: "kate@test.com", password: "abcdef" });
    expect(result.valid).toBe(true);
  });

  test("rejects whitespace-only name", () => {
    const result = validateRegister({ name: "   ", email: "kate@test.com", password: "password123" });
    expect(result.valid).toBe(false);
  });
});

// ── Feedback validation tests ─────────────────────────────────────────────────

describe("Feedback input validation", () => {

  function validateFeedback({ category, rating, message }) {
    if (!category || rating === undefined || rating === null || !message?.trim()) {
      return { valid: false, message: "Category, rating and message are required" };
    }
    if (rating < 1 || rating > 5) {
      return { valid: false, message: "Rating must be between 1 and 5" };
    }
    return { valid: true };
  }

  test("validates correct feedback", () => {
    const result = validateFeedback({ category: "Events", rating: 4, message: "Great event!" });
    expect(result.valid).toBe(true);
  });

  test("rejects missing category", () => {
    const result = validateFeedback({ rating: 4, message: "Great!" });
    expect(result.valid).toBe(false);
  });

  test("rejects rating of 0", () => {
    const result = validateFeedback({ category: "Events", rating: 0, message: "OK" });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/1 and 5/i);
  });

  test("rejects rating of 6", () => {
    const result = validateFeedback({ category: "Events", rating: 6, message: "OK" });
    expect(result.valid).toBe(false);
  });

  test("accepts all valid ratings 1 to 5", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(validateFeedback({ category: "Events", rating, message: "OK" }).valid).toBe(true);
    }
  });

  test("rejects whitespace-only message", () => {
    const result = validateFeedback({ category: "Events", rating: 3, message: "   " });
    expect(result.valid).toBe(false);
  });
});

// ── Booking validation tests ──────────────────────────────────────────────────

describe("Booking input validation", () => {

  const mongoose = { Types: { ObjectId: { isValid: (id) => /^[a-f\d]{24}$/i.test(id) } } };

  function validateBooking({ eventId, userName, userEmail }) {
    if (!eventId || !userName || !userEmail) {
      return { valid: false, message: "eventId, userName and userEmail are required" };
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return { valid: false, message: "Invalid eventId format" };
    }
    return { valid: true };
  }

  test("validates a correct booking", () => {
    const result = validateBooking({
      eventId: "507f1f77bcf86cd799439011",
      userName: "Jane", userEmail: "jane@test.com",
    });
    expect(result.valid).toBe(true);
  });

  test("rejects missing eventId", () => {
    const result = validateBooking({ userName: "Jane", userEmail: "jane@test.com" });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/required/i);
  });

  test("rejects invalid ObjectId format", () => {
    const result = validateBooking({
      eventId: "not-a-valid-id", userName: "Jane", userEmail: "jane@test.com",
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/invalid/i);
  });

  test("rejects missing userName", () => {
    const result = validateBooking({
      eventId: "507f1f77bcf86cd799439011", userEmail: "jane@test.com",
    });
    expect(result.valid).toBe(false);
  });
});