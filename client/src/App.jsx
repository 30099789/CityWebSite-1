// App.jsx — Sprint 3 Week 11
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAdmin, RequireAdminOnly } from "./context/AuthContext";

import MainLayout from "./layout/MainLayout";

import Home            from "./pages/Home";
import Announcements   from "./pages/Announcements";
import Events          from "./pages/Events";
import EventDetail     from "./pages/EventDetail";
import Faq             from "./pages/Faq";
import Services        from "./pages/Services";
import Feedback        from "./pages/Feedback";
import Contact         from "./pages/Contact";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";
import Profile         from "./pages/Profile";
import TermsOfService  from "./pages/TermsOfService";
import PrivacyPolicy   from "./pages/PrivacyPolicy";
import Accessibility   from "./pages/Accessibility";

import AdminDashboard        from "./pages/admin/AdminDashboard";
import ManageEvents          from "./pages/admin/ManageEvents";
import ManageUsers           from "./pages/admin/ManageUsers";
import ManageFeedback        from "./pages/admin/ManageFeedback";
import ManageBookings        from "./pages/admin/ManageBookings";
import ManageAnnouncements   from "./pages/admin/ManageAnnouncements";
import ManageServices        from "./pages/admin/ManageServices";
import ManageServiceRequests from "./pages/admin/ManageServiceRequests";
import XmlManager            from "./pages/admin/XmlManager";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="events"        element={<Events />} />
            <Route path="events/:id"    element={<EventDetail />} />
            <Route path="faq"           element={<Faq />} />
            <Route path="services"      element={<Services />} />
            <Route path="feedback"      element={<Feedback />} />
            <Route path="contact"       element={<Contact />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="terms"         element={<TermsOfService />} />
            <Route path="privacy"       element={<PrivacyPolicy />} />
            <Route path="accessibility" element={<Accessibility />} />
          </Route>

          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin + Staff */}
          <Route path="/admin"                   element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/events"            element={<RequireAdmin><ManageEvents /></RequireAdmin>} />
          <Route path="/admin/feedback"          element={<RequireAdmin><ManageFeedback /></RequireAdmin>} />
          <Route path="/admin/bookings"          element={<RequireAdmin><ManageBookings /></RequireAdmin>} />
          <Route path="/admin/announcements"     element={<RequireAdmin><ManageAnnouncements /></RequireAdmin>} />
          <Route path="/admin/services"          element={<RequireAdmin><ManageServices /></RequireAdmin>} />
          <Route path="/admin/service-requests"  element={<RequireAdmin><ManageServiceRequests /></RequireAdmin>} />
          <Route path="/admin/xml"               element={<RequireAdmin><XmlManager /></RequireAdmin>} />

          {/* Admin only */}
          <Route path="/admin/users" element={<RequireAdminOnly><ManageUsers /></RequireAdminOnly>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}