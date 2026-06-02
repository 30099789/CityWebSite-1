// src/__tests__/auth.test.js
// Unit tests for authentication utility functions

import { describe, test, expect, beforeEach, afterEach } from "vitest";

// localStorage polyfill -- jsdom does not always expose it in vitest environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key) => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear:      () => { store = {}; },
  };
})();

if (typeof localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });
}

const TOKEN_KEY = "citylink_token";
const USER_KEY  = "citylink_user";

function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isAdmin(user) {
  return user?.role === "admin";
}

function isAdminOrStaff(user) {
  return ["admin", "staff"].includes(user?.role);
}

function isLoggedIn() {
  return !!getToken();
}

describe("saveAuth and getToken", () => {

  beforeEach(() => clearAuth());
  afterEach(() => clearAuth());

  test("saves token to localStorage", () => {
    saveAuth("mytoken", { name: "Kate", role: "admin" });
    expect(getToken()).toBe("mytoken");
  });

  test("saves user to localStorage as JSON", () => {
    saveAuth("mytoken", { name: "Kate", role: "admin" });
    expect(getUser()?.name).toBe("Kate");
    expect(getUser()?.role).toBe("admin");
  });

  test("clearAuth removes token", () => {
    saveAuth("mytoken", { name: "Kate" });
    clearAuth();
    expect(getToken()).toBeNull();
  });

  test("clearAuth removes user", () => {
    saveAuth("mytoken", { name: "Kate" });
    clearAuth();
    expect(getUser()).toBeNull();
  });

  test("getToken returns null when not set", () => {
    expect(getToken()).toBeNull();
  });

  test("getUser returns null when not set", () => {
    expect(getUser()).toBeNull();
  });

  test("getUser handles corrupted JSON gracefully", () => {
    localStorage.setItem(USER_KEY, "not-valid-json{{{");
    expect(getUser()).toBeNull();
  });
});

describe("authHeaders", () => {

  beforeEach(() => clearAuth());
  afterEach(() => clearAuth());

  test("includes Authorization header when token exists", () => {
    saveAuth("mytoken123", { name: "Kate" });
    const headers = authHeaders();
    expect(headers.Authorization).toBe("Bearer mytoken123");
  });

  test("does not include Authorization when no token", () => {
    const headers = authHeaders();
    expect(headers.Authorization).toBeUndefined();
  });

  test("always includes Content-Type header", () => {
    const headers = authHeaders();
    expect(headers["Content-Type"]).toBe("application/json");
  });

  test("Content-Type is correct with token", () => {
    saveAuth("tok", { name: "Kate" });
    expect(authHeaders()["Content-Type"]).toBe("application/json");
  });
});

describe("isAdmin", () => {

  test("returns true for admin user", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
  });

  test("returns false for staff user", () => {
    expect(isAdmin({ role: "staff" })).toBe(false);
  });

  test("returns false for resident user", () => {
    expect(isAdmin({ role: "resident" })).toBe(false);
  });

  test("returns false for null user", () => {
    expect(isAdmin(null)).toBe(false);
  });

  test("returns false for undefined user", () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("isAdminOrStaff", () => {

  test("returns true for admin", () => {
    expect(isAdminOrStaff({ role: "admin" })).toBe(true);
  });

  test("returns true for staff", () => {
    expect(isAdminOrStaff({ role: "staff" })).toBe(true);
  });

  test("returns false for resident", () => {
    expect(isAdminOrStaff({ role: "resident" })).toBe(false);
  });

  test("returns false for null", () => {
    expect(isAdminOrStaff(null)).toBe(false);
  });
});

describe("isLoggedIn", () => {

  beforeEach(() => clearAuth());
  afterEach(() => clearAuth());

  test("returns true when token exists", () => {
    saveAuth("tok", { name: "Kate" });
    expect(isLoggedIn()).toBe(true);
  });

  test("returns false when no token", () => {
    expect(isLoggedIn()).toBe(false);
  });

  test("returns false after clearAuth", () => {
    saveAuth("tok", { name: "Kate" });
    clearAuth();
    expect(isLoggedIn()).toBe(false);
  });
});