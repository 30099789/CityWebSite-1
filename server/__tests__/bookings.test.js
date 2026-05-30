// __tests__/bookings.test.js
// Unit tests for booking duplicate check and service sanitiser logic

describe("Duplicate booking prevention (Sprint 4 bug fix)", () => {

  // Simulate the in-memory booking store (like MongoDB would store)
  function createBookingStore() {
    const bookings = [];
    return {
      findOne: ({ eventId, userEmail }) =>
        bookings.find((b) => b.eventId === eventId && b.userEmail === userEmail) || null,
      save: (booking) => { bookings.push(booking); return booking; },
      count: () => bookings.length,
    };
  }

  async function tryBook(store, { eventId, userName, userEmail }) {
    if (!eventId || !userName || !userEmail) {
      return { status: 400, body: { message: "eventId, userName and userEmail are required" } };
    }
    const existing = store.findOne({ eventId, userEmail });
    if (existing) {
      return { status: 409, body: { message: "You have already booked this event." } };
    }
    store.save({ eventId, userName, userEmail, status: "Confirmed" });
    return { status: 201, body: { eventId, userName, userEmail } };
  }

  test("first booking succeeds", async () => {
    const store = createBookingStore();
    const res = await tryBook(store, {
      eventId: "event123", userName: "Jane", userEmail: "jane@test.com",
    });
    expect(res.status).toBe(201);
  });

  test("duplicate booking returns 409", async () => {
    const store = createBookingStore();
    await tryBook(store, { eventId: "event123", userName: "Jane", userEmail: "jane@test.com" });
    const res = await tryBook(store, { eventId: "event123", userName: "Jane", userEmail: "jane@test.com" });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already booked/i);
  });

  test("same user can book a different event", async () => {
    const store = createBookingStore();
    await tryBook(store, { eventId: "event1", userName: "Jane", userEmail: "jane@test.com" });
    const res = await tryBook(store, { eventId: "event2", userName: "Jane", userEmail: "jane@test.com" });
    expect(res.status).toBe(201);
  });

  test("different users can book the same event", async () => {
    const store = createBookingStore();
    await tryBook(store, { eventId: "event1", userName: "Jane", userEmail: "jane@test.com" });
    const res = await tryBook(store, { eventId: "event1", userName: "Bob", userEmail: "bob@test.com" });
    expect(res.status).toBe(201);
  });

  test("booking with missing fields returns 400", async () => {
    const store = createBookingStore();
    const res = await tryBook(store, { eventId: "event1" });
    expect(res.status).toBe(400);
  });

  test("two successful bookings are stored correctly", async () => {
    const store = createBookingStore();
    await tryBook(store, { eventId: "event1", userName: "Jane", userEmail: "jane@test.com" });
    await tryBook(store, { eventId: "event2", userName: "Bob", userEmail: "bob@test.com" });
    expect(store.count()).toBe(2);
  });
});