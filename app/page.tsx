"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If not authenticated, redirect to login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!username.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Normalize username: remove @ if present, trim whitespace
    const normalizedUsername = username.trim().replace(/^@/, "");

    // Navigate to results page
    router.push(`/tiktok/${normalizedUsername}`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Ranked Video Analysis",
      description: "See all videos sorted by engagement, views, and performance metrics with comprehensive analytics.",
      benefit: "Identify what content resonates most with audiences"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "AI-Powered Insights",
      description: "Discover posting patterns, best performing content, and engagement trends with AI-powered analysis.",
      benefit: "Make data-driven decisions for your content strategy"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Lightning-Fast Results",
      description: "Get comprehensive analysis in seconds with our streamlined interface and real-time processing.",
      benefit: "Save hours of manual research"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Engagement Rate Calculator",
      description: "Automatic engagement rate calculation across all metrics including likes, comments, and shares.",
      benefit: "Understand true content performance at a glance"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Posting Pattern Analysis",
      description: "Identify optimal posting times and frequency patterns to maximize your reach and engagement.",
      benefit: "Learn when your competitors post for maximum reach"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Best Performing Content Discovery",
      description: "Instantly find top-performing videos by any metric - views, engagement, or growth rate.",
      benefit: "Reverse-engineer successful content strategies"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: "Real-Time Data Refresh",
      description: "Update analysis with fresh data anytime. Stay current with the latest content performance metrics.",
      benefit: "Always work with up-to-date insights"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Comprehensive Metrics",
      description: "Track views, likes, comments, shares, and engagement rates for a complete picture of performance.",
      benefit: "Complete picture of content performance"
    }
  ];

  const useCases = [
    {
      title: "Content Creators",
      icon: "🎬",
      points: [
        "Analyze top creators in your niche",
        "Learn what content performs best",
        "Optimize your posting strategy"
      ]
    },
    {
      title: "Marketers & Agencies",
      icon: "📊",
      points: [
        "Research competitor strategies",
        "Identify trending content formats",
        "Make data-driven campaign decisions"
      ]
    },
    {
      title: "Brand Managers",
      icon: "🏢",
      points: [
        "Find the right creators for partnerships",
        "Analyze creator performance before collaboration",
        "Track campaign effectiveness"
      ]
    },
    {
      title: "Analysts & Researchers",
      icon: "🔬",
      points: [
        "Study TikTok content trends",
        "Analyze engagement patterns",
        "Generate insights for reports"
      ]
    }
  ];

  const faqs = [
    {
      question: "How accurate is the data?",
      answer: "We use real-time data from TikTok via our trusted scraping partners. Data is updated every 48 hours to ensure accuracy and freshness."
    },
    {
      question: "How many creators can I analyze?",
      answer: "Free users can analyze up to 10 creators per day. Pro users have the same rate limit but can see up to 40 videos per analysis instead of 20."
    },
    {
      question: "What metrics are included?",
      answer: "We track views, likes, comments, shares, engagement rate, and posting dates for every video. All metrics are calculated in real-time from the latest available data."
    },
    {
      question: "Can I export the data?",
      answer: "Export functionality is coming soon. Currently, all data is viewable in your dashboard with full sorting and filtering capabilities."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard security practices and never share your data with third parties. All data is encrypted and stored securely."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your Pro subscription at any time. No long-term commitments or cancellation fees. Your subscription will remain active until the end of your billing period."
    }
  ];

  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24 relative" aria-label="Hero section">
        {/* Background gradient orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulseGlow pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16" direction="up">
            <div className="inline-block mb-8">
              <span className="glass-badge px-4 py-2 rounded-full border-blue-500/50 bg-blue-500/10 text-blue-400 text-sm font-medium relative overflow-hidden group cursor-pointer">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Beta 1.5 available now →
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmerSweep"></div>
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Find The Best Performing Short Form Content
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-6 max-w-3xl mx-auto">
              Uncover the top performing short form content in seconds
            </p>
            <p className="text-base md:text-lg text-white/60 mb-10 max-w-2xl mx-auto">
              Join thousands of creators making data-driven decisions. Get instant insights in seconds.
            </p>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <label htmlFor="username" className="sr-only">
                    TikTok Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter TikTok username (e.g., charlidamelio)"
                    className="glass-input w-full px-6 py-4 text-lg text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                    disabled={isSubmitting}
                    required
                  />
                  {/* Decorative gradient behind input */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-lg blur-xl -z-0"></div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !username.trim()}
                  className="btn-glass-primary px-8 py-4 text-white font-semibold rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap relative z-10"
                >
                  {isSubmitting ? "Loading..." : "Get Started Now"}
                </button>
              </div>
            </form>
            {!user && !loading && (
              <p className="text-sm text-white/60">
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Sign in
                </Link>{" "}
                or{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  create an account
                </Link>{" "}
                to get started
              </p>
            )}
          </ScrollReveal>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative" aria-label="How it works">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Get comprehensive TikTok insights in just three simple steps
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Enter Username", description: "Type any TikTok creator's username" },
              { step: "2", title: "AI Analysis", description: "Our system analyzes their content in seconds" },
              { step: "3", title: "Get Insights", description: "View ranked videos and key insights" },
              { step: "4", title: "Take Action", description: "Use data to improve your strategy" }
            ].map((item, index) => (
              <ScrollReveal
                key={index}
                delayMs={index * 100}
                direction="up"
                className="card-modern p-6 text-center relative group hover:scale-105 transition-all duration-300"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="icon-circle w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-blue-400">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 md:py-24" aria-label="Features">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to analyze TikTok content and make data-driven decisions
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal
                key={index}
                delayMs={index * 50}
                direction="up"
                className="card-modern p-6 text-left group hover:scale-[1.02] hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="icon-circle mb-4 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300 relative">
                    {/* Gradient overlay on icon */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-white group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <p className="text-blue-400 text-xs font-medium group-hover:text-cyan-400 transition-colors">
                    {feature.benefit}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Use Cases Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative" aria-label="Use cases">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Perfect For
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Whether you&apos;re a creator, marketer, or analyst, Shorts Spy helps you make smarter decisions
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <ScrollReveal
                key={index}
                delayMs={index * 100}
                direction="up"
                className="card-modern p-6 text-left group hover:scale-[1.02] hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">{useCase.title}</h3>
                  <ul className="space-y-2">
                    {useCase.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-white/70 text-sm flex items-start group-hover:text-white/90 transition-colors">
                        <span className="text-blue-400 mr-2 group-hover:text-cyan-400 transition-colors">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Pricing Section */}
      <div id="pricing" className="container mx-auto px-4 py-16 md:py-24" aria-label="Pricing">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose the plan that works for you. Upgrade or downgrade anytime.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <ScrollReveal
              direction="up"
              delayMs={0}
              className="card-modern p-8 text-left relative group hover:scale-[1.02] transition-all duration-300"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Free</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-white/60 text-lg ml-2">/month</span>
                </div>
                <p className="text-white/70 mb-6">Perfect for getting started with TikTok analysis</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>20 videos per analysis</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic video ranking table</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic insights panel</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Manual refresh (1-hour cooldown)</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10 analyses per day</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All core metrics</span>
                </li>
              </ul>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-all duration-200 group-hover:border-blue-500/50 group-hover:bg-blue-500/10"
                >
                  Get Started Free
                </Link>
              </div>
            </ScrollReveal>

            {/* Pro Tier */}
            <ScrollReveal
              direction="up"
              delayMs={100}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 animate-pulse">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/50">
                  Most Popular
                </span>
              </div>
              <div className="card-modern p-8 text-left relative border-2 border-blue-500/50 pt-12 group hover:scale-[1.02] hover:border-blue-500/80 transition-all duration-300 overflow-hidden">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Decorative accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Pro</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">$15</span>
                    <span className="text-white/60 text-lg ml-2">/month</span>
                  </div>
                  <p className="text-white/70 mb-6">For serious creators and professionals who need deeper insights</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>40 videos per analysis</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Extended video ranking</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced insights</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start text-white/80">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All core metrics</span>
                </li>
              </ul>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/50 group-hover:shadow-xl group-hover:shadow-blue-500/70"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/70">
              Everything you need to know about Shorts Spy
            </p>
          </ScrollReveal>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ScrollReveal
                key={index}
                delayMs={index * 50}
                direction="up"
                className="card-modern overflow-hidden group hover:border-blue-500/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-200"
                >
                  <span className="text-lg font-semibold text-white pr-4 group-hover:text-blue-400 transition-colors">{faq.question}</span>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all duration-200">
                    <svg
                      className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6">
                    <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Final CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative" aria-label="Call to action">
        {/* Background gradient orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulseGlow pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="card-modern p-12 text-center relative overflow-hidden group">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                Ready to unlock TikTok insights?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of creators making data-driven decisions. Start analyzing TikTok content in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 hover:scale-105"
                >
                  Start Analyzing Free
                </Link>
                <Link
                  href="#pricing"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-blue-500/50 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

