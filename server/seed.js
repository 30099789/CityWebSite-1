// seed.js — Sprint 3
// Seeds ALL collections: Users, Events, Announcements, Services, Feedback, Bookings
// Run: node seed.js
// WARNING: clears existing data in every collection before inserting.

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
require("dotenv").config();

const User         = require("./models/User");
const Event        = require("./models/Event");
const Announcement = require("./models/Announcement");
const Service      = require("./models/Service");
const Booking      = require("./models/Booking");

// ── Seed data ──────────────────────────────────────────────────────────────────

const users = [
  { name: "Alice Johnson", email: "alice@email.com",       password: "alice123", role: "resident" },
  { name: "Bob Smith",     email: "bob@email.com",         password: "bob123",   role: "resident" },
  { name: "Staff Member",  email: "staff@citylink.gov",    password: "staff123", role: "staff"    },
  { name: "David Lee",     email: "david@email.com",       password: "david123", role: "resident" },
  { name: "Emma Davis",    email: "emma@email.com",        password: "emma123",  role: "resident" },
  { name: "Admin User",    email: "admin@citylink.gov",    password: "admin123", role: "admin"    },
];

const events = [
  {
    title:       "Community Clean-Up Day",
    date:        "2026-04-15",
    time:        "9:00 AM - 1:00 PM",
    location:    "Central Park",
    description: "Join us for a community-wide clean-up of Central Park. Gloves and bags provided. Help keep our park beautiful for everyone.",
    category:    "Community",
    capacity:    50,
    booked:      32,
    status:      "Upcoming",
    imageUrl:    "/images/community-cleanup.jpg",
  },
  {
    title:       "Town Hall Meeting",
    date:        "2026-04-20",
    time:        "6:00 PM - 8:00 PM",
    location:    "Council Chambers",
    description: "Monthly town hall open to all residents. Agenda includes the new transport plan, park upgrades and budget Q&A.",
    category:    "Council",
    capacity:    100,
    booked:      67,
    status:      "Upcoming",
    imageUrl:    "/images/town-hall.jpg",
  },
  {
    title:       "Youth Coding Workshop",
    date:        "2026-04-25",
    time:        "10:00 AM - 12:00 PM",
    location:    "Library Room 2",
    description: "A free introductory coding workshop for ages 12–18. No experience needed. Laptops provided.",
    category:    "Education",
    capacity:    20,
    booked:      20,
    status:      "Full",
    imageUrl:    "/images/coding-workshop.jpg",
  },
  {
    title:       "Seniors Morning Tea",
    date:        "2026-05-02",
    time:        "10:00 AM - 11:30 AM",
    location:    "Community Centre",
    description: "A relaxed morning tea for seniors in our community. Light refreshments served. All welcome.",
    category:    "Community",
    capacity:    40,
    booked:      12,
    status:      "Upcoming",
    imageUrl:    "/images/seniors-tea.jpg",
  },
  {
    title:       "Farmers Market",
    date:        "2026-03-08",
    time:        "8:00 AM - 1:00 PM",
    location:    "Main Street Plaza",
    description: "Monthly farmers market featuring local produce, artisan goods and live music. Over 30 stalls.",
    category:    "Market",
    capacity:    200,
    booked:      200,
    status:      "Completed",
    imageUrl:    "/images/farmers-market.jpg",
  },
];

const announcements = [
  {
    title:    "Bin Night Changes - Easter Long Weekend",
    summary:  "Waste collection rescheduled for the Easter break.",
    content:  "Due to the Easter long weekend, bin night for the week of 18–22 April will be moved forward by one day. Please put your bins out the night before your usual collection day.",
    priority: "Alert",
    status:   "Published",
    date:     new Date("2026-03-28"),
    category: "Waste",
    audience: "All",
    author:   "CityLink Waste Team",
  },
  {
    title:    "New Online Rates Payment System Live",
    summary:  "Pay your council rates online via the new portal.",
    content:  "Residents can now pay council rates through the new online portal. The system accepts Visa, Mastercard and BPAY.",
    priority: "Update",
    status:   "Published",
    date:     new Date("2026-03-20"),
    category: "Rates",
    audience: "Residents",
    author:   "Finance Department",
  },
  {
    title:    "Road Works - High Street March 30 – April 4",
    summary:  "Expect delays near the High St / Main Rd intersection.",
    content:  "Council-approved road resurfacing works will take place on High Street between Main Road and Park Avenue from 30 March to 4 April.",
    priority: "Notice",
    status:   "Published",
    date:     new Date("2026-03-18"),
    category: "Roads",
    audience: "All",
    author:   "Infrastructure Services",
  },
  {
    title:    "Community Grant Applications Now Open",
    summary:  "Apply for up to $5,000 for local community projects.",
    content:  "CityLink Initiatives is accepting applications for the 2026 Community Grants Program. Grants of up to $5,000 are available for not-for-profit groups.",
    priority: "Update",
    status:   "Published",
    date:     new Date("2026-04-01"),
    category: "Grants",
    audience: "All",
    author:   "Community Development",
  },
  {
    title:    "Library Extended Summer Hours",
    summary:  "Extended hours at all branches during January and February.",
    content:  "All CityLink library branches will operate extended hours during January and February. Saturday hours extended to 5:00 PM and Sunday openings added from 11:00 AM – 3:00 PM.",
    priority: "Notice",
    status:   "Published",
    date:     new Date("2026-04-10"),
    category: "Libraries",
    audience: "All",
    author:   "Library Services",
  },
];

const services = [
  {
    title:       "Waste Collection",
    category:    "Waste",
    description: "Request waste collection, report a missed bin, or enquire about hard waste pickup schedules.",
    contact:     { phone: "0412345678", email: "waste@citylink.com" },
    imageUrl:    "/images/waste-collection.jpg",
  },
  {
    title:       "Rates Enquiry",
    category:    "Finance",
    description: "View your rates notice, make a payment, or set up a payment plan with our finance team.",
    contact:     { phone: "0412345679", email: "rates@citylink.com" },
    imageUrl:    "/images/rates-finance.jpg",
  },
  {
    title:       "Permits & Licences",
    category:    "Permits",
    description: "Apply for building permits, event licences, parking permits, and other council approvals.",
    contact:     { phone: "0412345680", email: "permits@citylink.com" },
    imageUrl:    "/images/permits.jpg",
  },
  {
    title:       "Parks & Recreation",
    category:    "Community",
    description: "Book a park pavilion, report damaged equipment, or enquire about recreational programs.",
    contact:     { phone: "0412345681", email: "parks@citylink.com" },
    imageUrl:    "/images/parks-recreation.jpg",
  },
  {
    title:       "Roads & Infrastructure",
    category:    "Infrastructure",
    description: "Report a pothole, request a street light repair, or check on planned roadworks in your area.",
    contact:     { phone: "0412345682", email: "roads@citylink.com" },
    imageUrl:    "/images/roads-infrastructure.jpg",
  },
];

// ── Run seed ───────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/citylink");
    console.log("MongoDB connected");

    // Users — hash all passwords
    await User.deleteMany({});
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
    );
    const insertedUsers = await User.insertMany(hashedUsers);
    console.log(`✓ Users:         ${insertedUsers.length} inserted`);
    console.log("  Admin login:   admin@citylink.gov / admin123");
    console.log("  Staff login:   staff@citylink.gov / staff123");

    // Events
    await Event.deleteMany({});
    const insertedEvents = await Event.insertMany(events);
    console.log(`✓ Events:        ${insertedEvents.length} inserted`);

    // Announcements
    await Announcement.deleteMany({});
    const insertedAnnouncements = await Announcement.insertMany(announcements);
    console.log(`✓ Announcements: ${insertedAnnouncements.length} inserted`);

    // Services
    await Service.deleteMany({});
    const insertedServices = await Service.insertMany(services);
    console.log(`✓ Services:      ${insertedServices.length} inserted`);

    // Bookings
    await Booking.deleteMany({});
    const evMap = {};
    insertedEvents.forEach((ev) => { evMap[ev.title] = ev; });

    const bookings = [
      { eventId: evMap["Community Clean-Up Day"]._id, eventTitle: "Community Clean-Up Day", userName: "Alice Johnson", userEmail: "alice@email.com", bookingDate: "2026-03-05", status: "Confirmed" },
      { eventId: evMap["Town Hall Meeting"]._id,       eventTitle: "Town Hall Meeting",       userName: "Bob Smith",     userEmail: "bob@email.com",   bookingDate: "2026-03-06", status: "Confirmed" },
      { eventId: evMap["Youth Coding Workshop"]._id,   eventTitle: "Youth Coding Workshop",   userName: "Emma Davis",    userEmail: "emma@email.com",  bookingDate: "2026-03-07", status: "Confirmed" },
      { eventId: evMap["Community Clean-Up Day"]._id,  eventTitle: "Community Clean-Up Day",  userName: "David Lee",     userEmail: "david@email.com", bookingDate: "2026-03-08", status: "Cancelled" },
      { eventId: evMap["Seniors Morning Tea"]._id,     eventTitle: "Seniors Morning Tea",     userName: "Alice Johnson", userEmail: "alice@email.com", bookingDate: "2026-03-09", status: "Pending"   },
    ];

    const insertedBookings = await Booking.insertMany(bookings);
    console.log(`✓ Bookings:      ${insertedBookings.length} inserted`);

    console.log("\nAll collections seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
}

seed();