import type { Metadata } from "next";
import { EnvelopeIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Contact & Help - Shorts Spy",
  description: "Get help and contact support for Shorts Spy",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact & Help
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            We're here to help! Get in touch with our support team or find answers to common questions.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card-modern p-6 group hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <EnvelopeIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Email Support
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:support@shortsspy.com"
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  support@shortsspy.com →
                </a>
              </div>
            </div>
          </div>

          <div className="card-modern p-6 group hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <ClockIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  Response Time
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
                <p className="text-white/50 text-xs">
                  Monday - Friday, 9 AM - 5 PM EST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card-modern p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <QuestionMarkCircleIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-semibold text-white mb-2">How do I get started?</h3>
              <p className="text-white/70 leading-relaxed">
                Simply sign up for a free account, enter a TikTok or Instagram creator's username, and our AI will analyze their content performance in seconds. You'll get comprehensive insights including engagement rates, top-performing videos, and posting patterns.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-semibold text-white mb-2">What data do you collect?</h3>
              <p className="text-white/70 leading-relaxed">
                We collect publicly available data from TikTok and Instagram, including video metrics (views, likes, comments, shares), engagement rates, and posting dates. We do not collect any personal information beyond what you provide during account creation. See our <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a> for more details.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-semibold text-white mb-2">How accurate is the data?</h3>
              <p className="text-white/70 leading-relaxed">
                We use real-time data from TikTok and Instagram via our trusted scraping partners. Data is updated every 48 hours to ensure accuracy and freshness. However, please note that social media platforms may occasionally have discrepancies in their own metrics.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel my subscription?</h3>
              <p className="text-white/70 leading-relaxed">
                Yes, you can cancel your Pro subscription at any time from your account settings. There are no cancellation fees, and your subscription will remain active until the end of your current billing period.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-semibold text-white mb-2">What's the difference between Free and Pro?</h3>
              <p className="text-white/70 leading-relaxed">
                Free users can analyze up to 10 creators per day and see 20 videos per analysis. Pro users get 40 videos per analysis, extended video ranking, advanced insights, and priority support. Both plans include all core metrics and features.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-semibold text-white mb-2">Do you support Instagram Reels?</h3>
              <p className="text-white/70 leading-relaxed">
                Yes! Shorts Spy supports both TikTok and Instagram Reels. You can analyze creators from either platform using the same powerful analytics tools.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How do I save videos for later?</h3>
              <p className="text-white/70 leading-relaxed">
                Click the bookmark icon on any video in the results table to save it to your saved videos collection. You can access all saved videos from your dashboard's "Saved" section.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="card-modern p-8 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 border-blue-500/30">
          <h2 className="text-2xl font-semibold text-white mb-4">Still Need Help?</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            If you can't find what you're looking for, don't hesitate to reach out. Our support team is here to help you get the most out of Shorts Spy.
          </p>
          <a
            href="mailto:support@shortsspy.com"
            className="inline-flex items-center gap-2 btn-glass-primary px-6 py-3 rounded-lg font-semibold"
          >
            <EnvelopeIcon className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

