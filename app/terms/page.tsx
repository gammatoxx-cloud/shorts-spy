import type { Metadata } from "next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Terms & Conditions - Shorts Spy",
  description: "Terms and Conditions for Shorts Spy",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
            <DocumentTextIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="card-modern p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              By accessing and using Shorts Spy ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="text-white/70 leading-relaxed">
              These Terms & Conditions ("Terms") govern your access to and use of our website, services, and applications (collectively, "the Service") operated by Shorts Spy ("we," "us," or "our").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Shorts Spy is a data analytics platform that provides insights and analysis of publicly available content from TikTok and Instagram. Our service includes:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>Analysis of creator performance metrics</li>
              <li>Engagement rate calculations</li>
              <li>Video ranking and sorting capabilities</li>
              <li>Historical data tracking</li>
              <li>Saved videos and collections</li>
              <li>Other features as described on our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3.1 Account Creation</h3>
                <p className="text-white/70 leading-relaxed">
                  To use certain features of our Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as necessary</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3.2 Account Eligibility</h3>
                <p className="text-white/70 leading-relaxed">
                  You must be at least 13 years old to create an account. By creating an account, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payment</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.1 Free and Pro Plans</h3>
                <p className="text-white/70 leading-relaxed mb-2">
                  We offer both free and paid subscription plans:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 space-y-1">
                  <li><strong className="text-white">Free Plan:</strong> Limited features and usage as described on our website</li>
                  <li><strong className="text-white">Pro Plan:</strong> Enhanced features and higher usage limits for a monthly fee</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.2 Payment Terms</h3>
                <p className="text-white/70 leading-relaxed mb-2">
                  For Pro subscriptions:
                </p>
                <ul className="list-disc list-inside text-white/70 ml-4 space-y-1">
                  <li>Subscriptions are billed monthly in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change pricing with 30 days' notice</li>
                  <li>You authorize us to charge your payment method automatically</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.3 Cancellation</h3>
                <p className="text-white/70 leading-relaxed">
                  You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period. You will continue to have access to Pro features until the end of the period for which you have paid.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to access the Service (except as permitted)</li>
              <li>Scrape, crawl, or harvest data beyond normal usage</li>
              <li>Resell or redistribute our data or services without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any activity that could harm our reputation or business</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.1 Our Content</h3>
                <p className="text-white/70 leading-relaxed">
                  The Service, including its original content, features, and functionality, is owned by Shorts Spy and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.2 User Content</h3>
                <p className="text-white/70 leading-relaxed">
                  You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing and improving our Service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.3 Third-Party Content</h3>
                <p className="text-white/70 leading-relaxed">
                  Our Service displays publicly available content from TikTok and Instagram. This content remains the property of its respective owners. We do not claim ownership of third-party content displayed through our Service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data and Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your information. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy. Please review our <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a> for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We strive to provide reliable service, but we do not guarantee that:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>The Service will be available at all times or without interruption</li>
              <li>The Service will be error-free or free from viruses</li>
              <li>All features will function as expected</li>
              <li>Data will always be accurate or up-to-date</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND</li>
              <li>WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRIOR TO THE CLAIM</li>
              <li>WE ARE NOT RESPONSIBLE FOR ANY LOSS OF DATA, PROFITS, OR BUSINESS OPPORTUNITIES</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
            <p className="text-white/70 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Shorts Spy, its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or expenses (including attorney's fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:
            </p>
            <ul className="list-disc list-inside text-white/70 ml-4 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, harmful, or illegal activity</li>
              <li>Non-payment of fees (for Pro subscriptions)</li>
              <li>Extended periods of inactivity</li>
              <li>At our sole discretion</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              Upon termination, your right to use the Service will immediately cease. We may delete your account and data, subject to our data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
            <p className="text-white/70 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Shorts Spy operates, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the appropriate courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Severability</h2>
            <p className="text-white/70 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Entire Agreement</h2>
            <p className="text-white/70 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Shorts Spy regarding your use of the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Contact Information</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              If you have any questions about these Terms & Conditions, please contact us:
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

