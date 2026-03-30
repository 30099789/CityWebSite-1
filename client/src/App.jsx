// App.jsx — Week 6
// Commits: added XML announcements data, Convert client from TypeScript to JavaScript
// Key additions: faq.xml, announcements.xml, Profile, legal pages all wired up
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAdmin } from "./context/AuthContext";
import { useEffect } from "react";
import { initMockData } from "./data/mockData";

import MainLayout from "./layout/MainLayout";

import Home from "./pages/Home";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Faq from "./pages/Faq";
import Services from "./pages/Services";
import Feedback from "./pages/Feedback";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Accessibility from "./pages/Accessibility";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFeedback from "./pages/admin/ManageFeedback";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";

export default function App() {
  useEffect(() => {
    initMockData();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="events" element={<Events />} />
            <Route path="faq" element={<Faq />} />
            <Route path="services" element={<Services />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="accessibility" element={<Accessibility />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/events"
            element={
              <RequireAdmin>
                <ManageEvents />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <ManageUsers />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/feedback"
            element={
              <RequireAdmin>
                <ManageFeedback />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <RequireAdmin>
                <ManageBookings />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/announcements"
            element={
              <RequireAdmin>
                <ManageAnnouncements />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}