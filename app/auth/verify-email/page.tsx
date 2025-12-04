"use client";

import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md text-center">
        <div className="card-modern p-8">
          <div className="mb-4">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2 text-white">Check your email</h1>
            <p className="text-white/70">
              We've sent you a confirmation link. Please check your inbox and
              click the link to verify your email address.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-white/60">
              Didn't receive the email? Check your spam folder or try signing up
              again.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-blue-400 hover:text-blue-300 hover:underline font-medium"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

