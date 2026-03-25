import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to Home</Link>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: March 2026</p>

      <div className="space-y-8 text-slate-600 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the CityLink Initiatives Smart Community Portal ("the Portal"),
            you agree to be bound by these Terms of Service. If you do not agree to these terms,
            please do not use the Portal. These terms apply to all visitors, registered users,
            and anyone who accesses or uses our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Use of the Portal</h2>
          <p className="mb-3">You agree to use the Portal only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Portal in any way that violates applicable local, national, or international laws</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Attempt to gain unauthorised access to any part of the Portal</li>
            <li>Interfere with or disrupt the operation of the Portal</li>
            <li>Use the Portal to harass, abuse, or harm other community members</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. User Accounts</h2>
          <p className="mb-3">
            To access certain features, you may be required to create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us immediately of any unauthorised use of your account</li>
          </ul>
          <p className="mt-3">
            CityLink Initiatives reserves the right to suspend or terminate accounts that violate
            these terms or are used for fraudulent purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Event Bookings</h2>
          <p>
            When you book a community event through the Portal, you agree to attend or cancel
            with reasonable notice. Repeated no-shows may result in restricted access to future
            bookings. CityLink Initiatives reserves the right to cancel or reschedule events
            and will notify registered attendees where possible.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Community Feedback</h2>
          <p>
            Feedback submitted through the Portal must be respectful and constructive. CityLink
            Initiatives reserves the right to remove feedback that contains offensive, defamatory,
            or inappropriate content. Submitted feedback may be used to improve our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Intellectual Property</h2>
          <p>
            All content on the Portal, including text, graphics, logos, and software, is the
            property of CityLink Initiatives and is protected by applicable intellectual property
            laws. You may not reproduce, distribute, or create derivative works without our
            express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Disclaimer of Warranties</h2>
          <p>
            The Portal is provided on an "as is" and "as available" basis. CityLink Initiatives
            makes no warranties, express or implied, regarding the reliability, accuracy, or
            availability of the Portal. We do not guarantee that the Portal will be error-free
            or uninterrupted.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, CityLink Initiatives shall not be liable
            for any indirect, incidental, special, or consequential damages arising from your
            use of the Portal, including loss of data or service interruptions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Changes to These Terms</h2>
          <p>
            CityLink Initiatives may update these Terms of Service from time to time. We will
            notify users of significant changes by posting a notice on the Portal. Your continued
            use of the Portal after changes are posted constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Contact Us</h2>
          <p>If you have questions about these Terms of Service, please contact us:</p>
          <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
            <p><span className="font-semibold text-slate-700">CityLink Initiatives</span></p>
            <p>123 Council Street, CityLink, CL 12345</p>
            <p>Email: legal@citylink.gov.au</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 flex gap-4 text-sm">
        <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        <Link to="/accessibility" className="text-blue-600 hover:underline">Accessibility</Link>
      </div>
    </main>
  );
}
