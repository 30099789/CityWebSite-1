// src/__tests__/bookings.test.js
// Unit tests for booking validation and duplicate prevention logic

import { describe, test, expect } from "vitest";

// Validate booking fields -- matches client-side checks in EventDetail.jsx
function validateBooking({ eventId, userName, userEmail }) {
  if (!eventId) return { valid: false, message: "Event ID is required" };
  if (!userName?.trim()) return { valid: false, message: "Name is required" };
  if (!userEmail?.trim()) return { valid: false, message: "Email is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return { valid: false, message: "Invalid email format" };
  }
  return { valid: true };
}

// Simulate duplicate check result interpretation
function isDuplicateBookingError(status, message) {
  return status === 409 || message?.toLowerCase().includes("already booked");
}

// Format booking date for display -- matches EventDetail.jsx
function formatBookingDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Check if event is bookable based on status
function isBookable(status) {
  return status === "Upcoming";
}

// Booking status display
function getBookingStatusLabel(status) {
  const labels = { Confirmed: "Confirmed", Cancelled: "Cancelled", Pending: "Pending" };
  return labels[status] || "Unknown";
}

// ── Booking validation tests ──────────────────────────────────────────────────

describe("validateBooking", () => {

  const valid = {
    eventId: "507f1f77bcf86cd799439011",
    userName: "Jane Resident",
    userEmail: "jane@example.com",
  };

  test("validates correct booking data", () => {
    expect(validateBooking(valid).valid).toBe(true);
  });

  test("rejects missing eventId", () => {
    const r = validateBooking({ ...valid, eventId: undefined });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/event id/i);
  });

  test("rejects missing userName", () => {
    expect(validateBooking({ ...valid, userName: undefined }).valid).toBe(false);
  });

  test("rejects whitespace-only userName", () => {
    expect(validateBooking({ ...valid, userName: "   " }).valid).toBe(false);
  });

  test("rejects missing userEmail", () => {
    expect(validateBooking({ ...valid, userEmail: undefined }).valid).toBe(false);
  });

  test("rejects invalid email format", () => {
    const r = validateBooking({ ...valid, userEmail: "notanemail" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/email/i);
  });

  test("rejects email without domain extension", () => {
    expect(validateBooking({ ...valid, userEmail: "user@nodomain" }).valid).toBe(false);
  });

  test("accepts valid email with subdomain", () => {
    expect(validateBooking({ ...valid, userEmail: "user@mail.example.com" }).valid).toBe(true);
  });
});

// ── Duplicate booking detection tests ─────────────────────────────────────────

describe("isDuplicateBookingError", () => {

  test("detects 409 status as duplicate", () => {
    expect(isDuplicateBookingError(409, "You have already booked this event.")).toBe(true);
  });

  test("detects already booked message as duplicate", () => {
    expect(isDuplicateBookingError(400, "already booked this event")).toBe(true);
  });

  test("returns false for 201 successful booking", () => {
    expect(isDuplicateBookingError(201, "Booking created")).toBe(false);
  });

  test("returns false for 400 validation error", () => {
    expect(isDuplicateBookingError(400, "userName is required")).toBe(false);
  });

  test("returns false for 500 server error", () => {
    expect(isDuplicateBookingError(500, "Internal server error")).toBe(false);
  });

  test("is case-insensitive for message check", () => {
    expect(isDuplicateBookingError(200, "ALREADY BOOKED")).toBe(true);
  });
});

// ── Event bookability tests ───────────────────────────────────────────────────

describe("isBookable", () => {

  test("Upcoming event is bookable", () => {
    expect(isBookable("Upcoming")).toBe(true);
  });

  test("Full event is not bookable", () => {
    expect(isBookable("Full")).toBe(false);
  });

  test("Completed event is not bookable", () => {
    expect(isBookable("Completed")).toBe(false);
  });

  test("Cancelled event is not bookable", () => {
    expect(isBookable("Cancelled")).toBe(false);
  });

  test("undefined status is not bookable", () => {
    expect(isBookable(undefined)).toBe(false);
  });
});

// ── Booking status label tests ────────────────────────────────────────────────

describe("getBookingStatusLabel", () => {

  test("returns Confirmed label", () => {
    expect(getBookingStatusLabel("Confirmed")).toBe("Confirmed");
  });

  test("returns Cancelled label", () => {
    expect(getBookingStatusLabel("Cancelled")).toBe("Cancelled");
  });

  test("returns Pending label", () => {
    expect(getBookingStatusLabel("Pending")).toBe("Pending");
  });

  test("returns Unknown for unrecognised status", () => {
    expect(getBookingStatusLabel("Weird")).toBe("Unknown");
  });

  test("returns Unknown for undefined", () => {
    expect(getBookingStatusLabel(undefined)).toBe("Unknown");
  });
});

// ── Date formatting tests ─────────────────────────────────────────────────────

describe("formatBookingDate", () => {

  test("formats a valid ISO date", () => {
    const result = formatBookingDate("2026-08-15T00:00:00.000Z");
    expect(result).toContain("2026");
  });

  test("returns empty string for undefined", () => {
    expect(formatBookingDate(undefined)).toBe("");
  });

  test("returns empty string for null", () => {
    expect(formatBookingDate(null)).toBe("");
  });

  test("returns empty string for empty string", () => {
    expect(formatBookingDate("")).toBe("");
  });
});