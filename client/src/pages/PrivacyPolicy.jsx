import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to Home</Link>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: March 2026</p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-8 text-sm text-blue-800">
        CityLink Initiatives is committed to protecting your privacy in accordance with the
        <strong> Australian Privacy Principles (APPs)</strong> under the <em>Privacy Act 1988 (Cth)</em>.
      </div>

      <div className="space-y-8 text-slate-600 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. About This Policy</h2>
          <p>
            This Privacy Policy explains how CityLink Initiatives collects, uses, stores, and
            discloses personal information through the Smart Community Portal. It applies to all
            users of the Portal, including residents, visitors, and staff members.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
          <p className="mb-3">We may collect the following types of personal information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium text-slate-700">Account information:</span> name, email address, and password when you register</li>
            <li><span className="font-medium text-slate-700">Booking information:</span> event registrations and service bookings you make</li>
            <li><span className="font-medium text-slate-700">Feedback submissions:</span> messages, categories, and contact details you provide</li>
            <li><span className="font-medium text-slate-700">Usage data:</span> pages visited and interactions with the Portal (non-identifiable)</li>
          </ul>
          <p className="mt-3">
            We only collect information that is necessary to provide our community services.
            No real personal data is used during the development and testing phase of this Portal —
            only sample mock data is used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. How We Use Your Information</h2>
          <p className="mb-3">Your personal information is used to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and manage your account on the Portal</li>
            <li>Process event bookings and service requests</li>
            <li>Respond to feedback and enquiries you submit</li>
            <li>Send relevant community announcements and updates</li>
            <li>Improve the Portal's functionality and user experience</li>
            <li>Meet our legal and regulatory obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. How We Store Your Information</h2>
          <p>
            Your information is stored securely within Australia. We take reasonable technical
            and organisational measures to protect personal information from unauthorised access,
            disclosure, alteration, or destruction. Access to personal data is restricted to
            authorised staff only.
          </p>
          <p className="mt-3">
            During the development phase, all data is stored locally in your browser's storage
            (localStorage) and is not transmitted to any external server.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Sharing Your Information</h2>
          <p>
            CityLink Initiatives does not sell, rent, or trade your personal information to
            third parties. We may share information with:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-3">
            <li>Government agencies where required by law</li>
            <li>Service providers who assist us in operating the Portal, under strict confidentiality agreements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Your Rights (Australian Privacy Principles)</h2>
          <p className="mb-3">Under the APPs, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium text-slate-700">Access</span> the personal information we hold about you</li>
            <li><span className="font-medium text-slate-700">Correct</span> inaccurate or outdated information</li>
            <li><span className="font-medium text-slate-700">Request deletion</span> of your personal information where applicable</li>
            <li><span className="font-medium text-slate-700">Complain</span> about a breach of your privacy rights</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, please contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Cookies</h2>
          <p>
            The Portal may use cookies or similar technologies to improve your browsing experience.
            Cookies help us remember your preferences and understand how visitors use the Portal.
            You can disable cookies in your browser settings, though some features may not function correctly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Children's Privacy</h2>
          <p>
            The Portal is not directed at children under the age of 13. We do not knowingly
            collect personal information from children. If you believe a child has provided us
            with personal information, please contact us and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Any changes will be posted on this
            page with an updated date. We encourage you to review this policy regularly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Contact & Complaints</h2>
          <p>
            If you have a privacy concern or complaint, or wish to access or correct your information,
            please contact our Privacy Officer:
          </p>
          <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
            <p><span className="font-semibold text-slate-700">Privacy Officer — CityLink Initiatives</span></p>
            <p>123 Council Street, CityLink, CL 12345</p>
            <p>Email: privacy@citylink.gov.au</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          <p className="mt-3">
            If you are not satisfied with our response, you may contact the
            <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
              Office of the Australian Information Commissioner (OAIC)
            </a>.
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 flex gap-4 text-sm">
        <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
        <Link to="/accessibility" className="text-blue-600 hover:underline">Accessibility</Link>
      </div>
    </main>
  );
}
