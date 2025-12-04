import type { Metadata } from "next";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Privacy Policy - Shorts Spy",
  description: "Privacy Policy for Shorts Spy",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="card-modern p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Welcome to Shorts Spy ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p className="text-white/70 leading-relaxed">
              By using Shorts Spy, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2.1 Account Information</h3>
                <p className="text-white/70 leading-relaxed">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                  <li>Email address</li>
                  <li>Password (encrypted and hashed)</li>
                  <li>Account preferences and settings</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2.2 Usage Data</h3>
                <p className="text-white/70 leading-relaxed">
                  We automatically collect information about how you use our service, including:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                  <li>Search queries and analyzed creators</li>
                  <li>Features accessed and interactions</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and general location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2.3 Public Social Media Data</h3>
                <p className="text-white/70 leading-relaxed">
                  We collect publicly available data from TikTok and Instagram, including:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                  <li>Video metrics (views, likes, comments, shares)</li>
                  <li>Engagement rates and performance data</li>
                  <li>Posting dates and content descriptions</li>
                  <li>Creator profile information (publicly available)</li>
                </ul>
                <p className="text-white/70 leading-relaxed mt-2">
                  This data is collected from public profiles and content only. We do not access private accounts or non-public information.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>To provide, maintain, and improve our service</li>
              <li>To process your account registration and manage your subscription</li>
              <li>To analyze creator performance and generate insights</li>
              <li>To communicate with you about your account, updates, and support requests</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
              <li>To personalize your experience and provide relevant content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.1 Service Providers</h3>
                <p className="text-white/70 leading-relaxed">
                  We may share information with trusted third-party service providers who assist us in operating our service, such as:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                  <li>Cloud hosting and database services (Supabase)</li>
                  <li>Payment processors (Stripe via Supabase)</li>
                  <li>Data scraping services (Apify)</li>
                  <li>Analytics and monitoring tools</li>
                </ul>
                <p className="text-white/70 leading-relaxed mt-2">
                  These providers are contractually obligated to protect your information and use it only for the purposes we specify.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.2 Legal Requirements</h3>
                <p className="text-white/70 leading-relaxed">
                  We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, property, or safety, or that of our users or others.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.3 Business Transfers</h3>
                <p className="text-white/70 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>Encryption of data in transit (SSL/TLS)</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure cloud infrastructure (Supabase)</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li><strong className="text-white">Access:</strong> Request access to your personal data</li>
              <li><strong className="text-white">Correction:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your account and data</li>
              <li><strong className="text-white">Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong className="text-white">Account Management:</strong> Update your account settings at any time</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              To exercise these rights, please contact us at <a href="mailto:support@shortsspy.com" className="text-blue-400 hover:text-blue-300 underline">support@shortsspy.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Provide personalized content and features</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
            <p className="text-white/70 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our service, you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Data Retention</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>Provide our service to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Maintain accurate records for business purposes</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-white/70 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/90 font-medium mb-2">Shorts Spy Support</p>
              <p className="text-white/70">
                Email: <a href="mailto:support@shortsspy.com" className="text-blue-400 hover:text-blue-300 underline">support@shortsspy.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

