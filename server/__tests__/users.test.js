// __tests__/users.test.js
// Unit tests for user validation and role logic

const bcrypt = require("bcryptjs");

// Validate registration -- matches server logic in userRoutes.js
function validateRegister({ name, email, password }) {
  if (!name?.trim() || !email?.trim() || !password) {
    return { valid: false, message: "Name, email and password are required" };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "Invalid email format" };
  }
  return { valid: true };
}

// Role permission checks -- matches requireAdmin and requireAdminOnly middleware
function canWriteContent(role) {
  return ["admin", "staff"].includes(role);
}

function canManageUsers(role) {
  return role === "admin";
}

function isValidRole(role) {
  return ["admin", "staff", "resident"].includes(role);
}

// Normalise email -- matches server logic (lowercase before save)
function normaliseEmail(email) {
  return email?.toLowerCase().trim();
}

// ── Registration validation tests ─────────────────────────────────────────────

describe("validateRegister", () => {

  test("validates correct registration input", () => {
    expect(validateRegister({ name: "Kate", email: "kate@test.com", password: "password123" }).valid).toBe(true);
  });

  test("rejects empty name", () => {
    const r = validateRegister({ name: "", email: "kate@test.com", password: "password123" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/required/i);
  });

  test("rejects whitespace-only name", () => {
    expect(validateRegister({ name: "   ", email: "kate@test.com", password: "password123" }).valid).toBe(false);
  });

  test("rejects empty email", () => {
    expect(validateRegister({ name: "Kate", email: "", password: "password123" }).valid).toBe(false);
  });

  test("rejects invalid email format", () => {
    const r = validateRegister({ name: "Kate", email: "notanemail", password: "password123" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/email/i);
  });

  test("rejects email without @ symbol", () => {
    expect(validateRegister({ name: "Kate", email: "katetest.com", password: "password123" }).valid).toBe(false);
  });

  test("rejects missing password", () => {
    expect(validateRegister({ name: "Kate", email: "kate@test.com", password: "" }).valid).toBe(false);
  });

  test("rejects password shorter than 6 characters", () => {
    const r = validateRegister({ name: "Kate", email: "kate@test.com", password: "abc" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/6 characters/i);
  });

  test("accepts password exactly 6 characters", () => {
    expect(validateRegister({ name: "Kate", email: "kate@test.com", password: "abcdef" }).valid).toBe(true);
  });

  test("accepts long passwords", () => {
    expect(validateRegister({ name: "Kate", email: "kate@test.com", password: "averylongpassword123" }).valid).toBe(true);
  });
});

// ── Role permission tests ─────────────────────────────────────────────────────

describe("canWriteContent", () => {

  test("admin can write content", () => {
    expect(canWriteContent("admin")).toBe(true);
  });

  test("staff can write content", () => {
    expect(canWriteContent("staff")).toBe(true);
  });

  test("resident cannot write content", () => {
    expect(canWriteContent("resident")).toBe(false);
  });

  test("unknown role cannot write content", () => {
    expect(canWriteContent("superuser")).toBe(false);
  });

  test("undefined role cannot write content", () => {
    expect(canWriteContent(undefined)).toBe(false);
  });
});

describe("canManageUsers", () => {

  test("admin can manage users", () => {
    expect(canManageUsers("admin")).toBe(true);
  });

  test("staff cannot manage users", () => {
    expect(canManageUsers("staff")).toBe(false);
  });

  test("resident cannot manage users", () => {
    expect(canManageUsers("resident")).toBe(false);
  });
});

describe("isValidRole", () => {

  test("admin is valid role", () => {
    expect(isValidRole("admin")).toBe(true);
  });

  test("staff is valid role", () => {
    expect(isValidRole("staff")).toBe(true);
  });

  test("resident is valid role", () => {
    expect(isValidRole("resident")).toBe(true);
  });

  test("superuser is not a valid role", () => {
    expect(isValidRole("superuser")).toBe(false);
  });

  test("empty string is not a valid role", () => {
    expect(isValidRole("")).toBe(false);
  });

  test("undefined is not a valid role", () => {
    expect(isValidRole(undefined)).toBe(false);
  });
});

// ── Email normalisation tests ─────────────────────────────────────────────────

describe("normaliseEmail", () => {

  test("converts email to lowercase", () => {
    expect(normaliseEmail("KATE@TEST.COM")).toBe("kate@test.com");
  });

  test("trims whitespace from email", () => {
    expect(normaliseEmail("  kate@test.com  ")).toBe("kate@test.com");
  });

  test("handles mixed case email", () => {
    expect(normaliseEmail("Kate@Test.COM")).toBe("kate@test.com");
  });

  test("returns undefined for undefined input", () => {
    expect(normaliseEmail(undefined)).toBeUndefined();
  });
});

// ── Password security tests ───────────────────────────────────────────────────

describe("bcrypt password security", () => {

  test("hashed password is not equal to plain text", async () => {
    const hash = await bcrypt.hash("mypassword", 10);
    expect(hash).not.toBe("mypassword");
  });

  test("correct password verifies successfully", async () => {
    const hash = await bcrypt.hash("mypassword", 10);
    expect(await bcrypt.compare("mypassword", hash)).toBe(true);
  });

  test("wrong password fails verification", async () => {
    const hash = await bcrypt.hash("mypassword", 10);
    expect(await bcrypt.compare("wrongpassword", hash)).toBe(false);
  });

  test("different hashes are generated for same password (salt)", async () => {
    const h1 = await bcrypt.hash("mypassword", 10);
    const h2 = await bcrypt.hash("mypassword", 10);
    expect(h1).not.toBe(h2);
  });

  test("both salted hashes still verify correctly", async () => {
    const h1 = await bcrypt.hash("mypassword", 10);
    const h2 = await bcrypt.hash("mypassword", 10);
    expect(await bcrypt.compare("mypassword", h1)).toBe(true);
    expect(await bcrypt.compare("mypassword", h2)).toBe(true);
  });
});