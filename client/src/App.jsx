// App.jsx — Week 6
// Commits: added XML announcements data, Convert client from TypeScript to JavaScript
// Key additions: faq.xml, announcements.xml, Profile, legal pages all wired up
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import { initMockData } from "./data/mockData";
import MainLayout    from "./layout/MainLayout";
import Home          from "./pages/Home";
import Announcements from "./pages/Announcements";
import Events        from "./pages/Events";
import Faq           from "./pages/Faq";
import Services      from "./pages/Services";
import Feedback      from "./pages/Feedback";
import Contact       from "./pages/Contact";
import Login         from "./pages/Login";
import Signup        from "./pages/Signup";
import Profile       from "./pages/Profile";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy  from "./pages/PrivacyPolicy";
import Accessibility  from "./pages/Accessibility";

export default function App() {
  useEffect(() => { initMockData(); }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index               element={<Home />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="events"        element={<Events />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
