// mockData.js — Sprint 2
// All data lives here. No backend needed — stored/read from localStorage.

export const mockUsers = [
  { id: "u1", name: "Alice Johnson", email: "alice@email.com", password: "alice123", role: "user",  status: "Active",   joined: "2025-01-10" },
  { id: "u2", name: "Bob Smith",     email: "bob@email.com",   password: "bob123",   role: "user",  status: "Active",   joined: "2025-02-14" },
  { id: "u3", name: "Carol White",   email: "carol@email.com", password: "carol123", role: "staff", status: "Active",   joined: "2025-03-01" },
  { id: "u4", name: "David Lee",     email: "david@email.com", password: "david123", role: "user",  status: "Inactive", joined: "2025-03-20" },
  { id: "u5", name: "Emma Davis",    email: "emma@email.com",  password: "emma123",  role: "user",  status: "Active",   joined: "2025-04-05" },
];

export const mockEvents = [
  { id: "evt-1", title: "Community Clean-Up Day",  date: "2026-04-15", time: "9:00 AM - 1:00 PM",   location: "Central Park",      capacity: 50,  booked: 32,  status: "Upcoming",  category: "Community" },
  { id: "evt-2", title: "Town Hall Meeting",        date: "2026-04-20", time: "6:00 PM - 8:00 PM",   location: "Council Chambers",  capacity: 100, booked: 67,  status: "Upcoming",  category: "Council"   },
  { id: "evt-3", title: "Youth Coding Workshop",    date: "2026-04-25", time: "10:00 AM - 12:00 PM", location: "Library Room 2",    capacity: 20,  booked: 20,  status: "Full",      category: "Education" },
  { id: "evt-4", title: "Seniors Morning Tea",      date: "2026-05-02", time: "10:00 AM - 11:30 AM", location: "Community Centre",  capacity: 40,  booked: 12,  status: "Upcoming",  category: "Community" },
  { id: "evt-5", title: "Farmers Market",           date: "2026-03-08", time: "8:00 AM - 1:00 PM",   location: "Main Street Plaza", capacity: 200, booked: 200, status: "Completed", category: "Market"    },
];

export const mockAnnouncements = [
  { id: "ann-1", title: "Bin Night Changes - Easter Long Weekend",    summary: "Waste collection rescheduled for the Easter break.",         priority: "Alert",  status: "Published", date: "2026-03-28", category: "Waste",     audience: "All"       },
  { id: "ann-2", title: "New Online Rates Payment System Live",       summary: "Pay your council rates online via the new portal.",          priority: "Update", status: "Published", date: "2026-03-20", category: "Rates",     audience: "Residents" },
  { id: "ann-3", title: "Road Works - High Street March 30-April 4", summary: "Expect delays near the High St / Main Rd intersection.",     priority: "Notice", status: "Published", date: "2026-03-18", category: "Roads",     audience: "All"       },
  { id: "ann-4", title: "Community Grant Applications Now Open",      summary: "Apply for up to $5,000 for local community projects.",       priority: "Update", status: "Published", date: "2026-04-01", category: "Grants",    audience: "All"       },
  { id: "ann-5", title: "Library Summer Hours",                       summary: "Extended hours at all branches during January and February.", priority: "Notice", status: "Published", date: "2026-04-10", category: "Libraries", audience: "All"       },
];

export const mockFeedback = [
  { id: "fb-1", userName: "Alice Johnson", userEmail: "alice@email.com", category: "Events",   rating: 5, message: "Loved the community clean-up! Please run it monthly.",           status: "New",         submittedDate: "2026-03-10", response: "" },
  { id: "fb-2", userName: "Bob Smith",     userEmail: "bob@email.com",   category: "Services", rating: 3, message: "The waste collection form is confusing - too many steps.",        status: "In Progress", submittedDate: "2026-03-12", response: "Thanks Bob, we are reviewing the form UX." },
  { id: "fb-3", userName: "Emma Davis",    userEmail: "emma@email.com",  category: "Website",  rating: 4, message: "Can you add a dark mode option to the portal?",                  status: "New",         submittedDate: "2026-03-14", response: "" },
  { id: "fb-4", userName: "David Lee",     userEmail: "david@email.com", category: "Roads",    rating: 2, message: "The High Street roadworks sign is missing at the northern end.",  status: "Resolved",    submittedDate: "2026-03-15", response: "Sign has been replaced. Thank you for reporting." },
  { id: "fb-5", userName: "Carol White",   userEmail: "carol@email.com", category: "General",  rating: 5, message: "Great portal overall. The FAQ section is very helpful.",          status: "Closed",      submittedDate: "2026-03-16", response: "Thank you for the kind feedback!" },
];

export const mockBookings = [
  { id: "bk-1", eventId: "evt-1", eventTitle: "Community Clean-Up Day", userName: "Alice Johnson", userEmail: "alice@email.com", bookingDate: "2026-03-05", status: "Confirmed" },
  { id: "bk-2", eventId: "evt-2", eventTitle: "Town Hall Meeting",       userName: "Bob Smith",     userEmail: "bob@email.com",   bookingDate: "2026-03-06", status: "Confirmed" },
  { id: "bk-3", eventId: "evt-3", eventTitle: "Youth Coding Workshop",   userName: "Emma Davis",    userEmail: "emma@email.com",  bookingDate: "2026-03-07", status: "Confirmed" },
  { id: "bk-4", eventId: "evt-1", eventTitle: "Community Clean-Up Day",  userName: "David Lee",     userEmail: "david@email.com", bookingDate: "2026-03-08", status: "Cancelled" },
  { id: "bk-5", eventId: "evt-4", eventTitle: "Seniors Morning Tea",     userName: "Carol White",   userEmail: "carol@email.com", bookingDate: "2026-03-09", status: "Pending"   },
];

// localStorage helpers

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Sprint 2: seed localStorage directly - no server needed
export async function initMockData() {
  if (!localStorage.getItem("citylink_seeded")) {
    safeWrite("citylink_users",         mockUsers);
    safeWrite("citylink_events",        mockEvents);
    safeWrite("citylink_announcements", mockAnnouncements);
    safeWrite("citylink_feedback",      mockFeedback);
    safeWrite("citylink_bookings",      mockBookings);
    localStorage.setItem("citylink_seeded", "true");
  }
}

export const getUsers         = () => safeRead("citylink_users",         mockUsers);
export const getEvents        = () => safeRead("citylink_events",        mockEvents);
export const getAnnouncements = () => safeRead("citylink_announcements", mockAnnouncements);
export const getFeedback      = () => safeRead("citylink_feedback",      mockFeedback);
export const getBookings      = () => safeRead("citylink_bookings",      mockBookings);

export const saveUsers         = (d) => safeWrite("citylink_users",         d);
export const saveEvents        = (d) => safeWrite("citylink_events",        d);
export const saveAnnouncements = (d) => safeWrite("citylink_announcements", d);
export const saveFeedback      = (d) => safeWrite("citylink_feedback",      d);
export const saveBookings      = (d) => safeWrite("citylink_bookings",      d);
