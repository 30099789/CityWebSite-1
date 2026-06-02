// __tests__/services.test.js
// Unit tests for service and service request validation logic

// Sanitise service -- matches sanitiseService in XmlManager.jsx
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

// Validate service request -- matches server-side validation in serviceRequestsRouter.js
function validateServiceRequest({ serviceId, userName, userEmail }) {
  if (!serviceId || !userName || !userEmail) {
    return { valid: false, message: "serviceId, userName and userEmail are required" };
  }
  return { valid: true };
}

// Validate service creation -- matches server-side validation in servicesRouter.js
function validateService({ title, description, category, contact }) {
  if (!title || !description || !category || !contact?.phone || !contact?.email) {
    return { valid: false, message: "Title, description, category, phone and email are required" };
  }
  if (!/^[0-9]{10}$/.test(contact.phone)) {
    return { valid: false, message: "Invalid phone number" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return { valid: false, message: "Invalid email format" };
  }
  return { valid: true };
}

// ── sanitiseService tests ─────────────────────────────────────────────────────

describe("sanitiseService", () => {

  test("passes through valid service data", () => {
    const result = sanitiseService({
      title: "Waste Management", description: "Weekly pickup",
      category: "Waste", "contact.phone": "0890000001", "contact.email": "waste@city.gov",
    });
    expect(result.title).toBe("Waste Management");
    expect(result.contact.phone).toBe("0890000001");
    expect(result.contact.email).toBe("waste@city.gov");
  });

  test("fills defaults for missing fields", () => {
    const result = sanitiseService({});
    expect(result.title).toBe("Untitled Service");
    expect(result.description).toBe("No description provided");
    expect(result.category).toBe("General");
    expect(result.contact.phone).toBe("0800000000");
    expect(result.contact.email).toBe("admin@citylink.gov");
  });

  test("strips non-digit characters from phone number", () => {
    expect(sanitiseService({ "contact.phone": "089 000 0001" }).contact.phone).toBe("0890000001");
  });

  test("strips dashes from phone number", () => {
    expect(sanitiseService({ "contact.phone": "089-000-0001" }).contact.phone).toBe("0890000001");
  });

  test("falls back to default phone if number is not 10 digits", () => {
    expect(sanitiseService({ "contact.phone": "12345" }).contact.phone).toBe("0800000000");
  });

  test("falls back to default phone if number is too long", () => {
    expect(sanitiseService({ "contact.phone": "089000000199" }).contact.phone).toBe("0800000000");
  });

  test("reads phone from item.phone if contact.phone is missing", () => {
    expect(sanitiseService({ phone: "0812345678" }).contact.phone).toBe("0812345678");
  });

  test("reads email from item.email if contact.email is missing", () => {
    expect(sanitiseService({ email: "test@test.com" }).contact.email).toBe("test@test.com");
  });

  test("trims whitespace from string fields", () => {
    const result = sanitiseService({ title: "  Parks  ", category: "  Environment  " });
    expect(result.title).toBe("Parks");
    expect(result.category).toBe("Environment");
  });

  test("imageUrl defaults to empty string if missing", () => {
    expect(sanitiseService({}).imageUrl).toBe("");
  });
});

// ── validateService tests ─────────────────────────────────────────────────────

describe("validateService", () => {

  const valid = {
    title: "Parks", description: "Park maintenance",
    category: "Environment", contact: { phone: "0890000001", email: "parks@city.gov" },
  };

  test("validates correct service data", () => {
    expect(validateService(valid).valid).toBe(true);
  });

  test("rejects missing title", () => {
    const r = validateService({ ...valid, title: "" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/required/i);
  });

  test("rejects missing description", () => {
    expect(validateService({ ...valid, description: "" }).valid).toBe(false);
  });

  test("rejects missing category", () => {
    expect(validateService({ ...valid, category: "" }).valid).toBe(false);
  });

  test("rejects missing contact phone", () => {
    expect(validateService({ ...valid, contact: { email: "x@x.com" } }).valid).toBe(false);
  });

  test("rejects missing contact email", () => {
    expect(validateService({ ...valid, contact: { phone: "0890000001" } }).valid).toBe(false);
  });

  test("rejects phone shorter than 10 digits", () => {
    const r = validateService({ ...valid, contact: { phone: "089000", email: "x@x.com" } });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/phone/i);
  });

  test("rejects phone longer than 10 digits", () => {
    expect(validateService({ ...valid, contact: { phone: "08900000011", email: "x@x.com" } }).valid).toBe(false);
  });

  test("rejects phone with non-digit characters", () => {
    expect(validateService({ ...valid, contact: { phone: "089-000-00", email: "x@x.com" } }).valid).toBe(false);
  });

  test("rejects invalid email format", () => {
    const r = validateService({ ...valid, contact: { phone: "0890000001", email: "notanemail" } });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/email/i);
  });

  test("rejects email without domain", () => {
    expect(validateService({ ...valid, contact: { phone: "0890000001", email: "user@" } }).valid).toBe(false);
  });

  test("accepts 10-digit phone exactly", () => {
    expect(validateService({ ...valid, contact: { phone: "0890000001", email: "x@x.com" } }).valid).toBe(true);
  });
});

// ── validateServiceRequest tests ──────────────────────────────────────────────

describe("validateServiceRequest", () => {

  const valid = {
    serviceId: "507f1f77bcf86cd799439011",
    userName: "Jane Resident",
    userEmail: "jane@example.com",
  };

  test("validates correct service request", () => {
    expect(validateServiceRequest(valid).valid).toBe(true);
  });

  test("rejects missing serviceId", () => {
    const r = validateServiceRequest({ ...valid, serviceId: undefined });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/required/i);
  });

  test("rejects missing userName", () => {
    expect(validateServiceRequest({ ...valid, userName: undefined }).valid).toBe(false);
  });

  test("rejects missing userEmail", () => {
    expect(validateServiceRequest({ ...valid, userEmail: undefined }).valid).toBe(false);
  });

  test("rejects empty userName string", () => {
    expect(validateServiceRequest({ ...valid, userName: "" }).valid).toBe(false);
  });

  test("rejects empty userEmail string", () => {
    expect(validateServiceRequest({ ...valid, userEmail: "" }).valid).toBe(false);
  });
});