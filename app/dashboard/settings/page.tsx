"use client";

import { useState, FormEvent, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  // Email update state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { level: "weak", text: "Weak", color: "text-red-400" };
    if (newPassword.length < 10) return { level: "medium", text: "Medium", color: "text-yellow-400" };
    return { level: "strong", text: "Strong", color: "text-emerald-400" };
  }, [newPassword]);

  const handleEmailUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setEmailLoading(true);

    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      setEmailLoading(false);
      return;
    }

    if (newEmail === user?.email) {
      setEmailError("New email must be different from current email");
      setEmailLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        setEmailError(error.message);
      } else {
        setEmailSuccess(true);
        setNewEmail("");
        // Clear success message after 5 seconds
        setTimeout(() => setEmailSuccess(false), 5000);
      }
    } catch (err: any) {
      setEmailError(err.message || "An error occurred. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError("Current password is incorrect");
        setPasswordLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Clear success message after 5 seconds
        setTimeout(() => setPasswordSuccess(false), 5000);
      }
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton type="dashboard" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/70 mb-4">
            Please sign in to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1 text-white bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-white/60 text-sm">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
        {/* Email Update Section */}
        <div className="card-modern p-6 relative settings-section-card settings-section-email">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <EnvelopeIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">Email Address</h2>
              <p className="text-sm text-white/60">Update your email address</p>
            </div>
          </div>
          <form onSubmit={handleEmailUpdate} className="space-y-5">
            <div>
              <label htmlFor="current-email" className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <EnvelopeIcon className="w-4 h-4 text-white/50" />
                Current Email
              </label>
              <input
                id="current-email"
                type="email"
                value={user.email || ""}
                disabled
                className="glass-input w-full px-4 py-3 text-base text-white/60 placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="new-email" className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <EnvelopeIcon className="w-4 h-4 text-white/50" />
                New Email
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                required
                className="glass-input w-full px-4 py-3 text-base text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                disabled={emailLoading}
              />
            </div>
            {emailError && (
              <div className="settings-message settings-message-error animate-fadeIn">
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
            {emailSuccess && (
              <div className="settings-message settings-message-success animate-fadeIn">
                <CheckCircleIconSolid className="w-5 h-5 flex-shrink-0" />
                <span>Email update initiated. Please check your new email inbox to confirm the change.</span>
              </div>
            )}
            <button
              type="submit"
              disabled={emailLoading || !newEmail}
              className="btn-glass-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {emailLoading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>

        {/* Password Update Section */}
        <div className="card-modern p-6 relative settings-section-card settings-section-password">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <LockClosedIcon className="w-6 h-6 text-teal-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">Password</h2>
              <p className="text-sm text-white/60">Change your account password</p>
            </div>
          </div>
          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div>
              <label htmlFor="current-password" className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <LockClosedIcon className="w-4 h-4 text-white/50" />
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="glass-input w-full px-4 py-3 pr-12 text-base text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors focus:outline-none"
                  disabled={passwordLoading}
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="new-password" className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <LockClosedIcon className="w-4 h-4 text-white/50" />
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                  className="glass-input w-full px-4 py-3 pr-12 text-base text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors focus:outline-none"
                  disabled={passwordLoading}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {passwordStrength && (
                  <>
                    <p className={`text-xs font-medium ${passwordStrength.color}`}>
                      Strength: {passwordStrength.text}
                    </p>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.level === "weak"
                            ? "bg-red-400 w-1/3"
                            : passwordStrength.level === "medium"
                            ? "bg-yellow-400 w-2/3"
                            : "bg-emerald-400 w-full"
                        }`}
                      />
                    </div>
                  </>
                )}
                {!passwordStrength && (
                  <p className="text-xs text-white/50">Must be at least 6 characters</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <LockClosedIcon className="w-4 h-4 text-white/50" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  className="glass-input w-full px-4 py-3 pr-12 text-base text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors focus:outline-none"
                  disabled={passwordLoading}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {passwordError && (
              <div className="settings-message settings-message-error animate-fadeIn">
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="settings-message settings-message-success animate-fadeIn">
                <CheckCircleIconSolid className="w-5 h-5 flex-shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-glass-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Account Actions Section */}
        <div className="card-modern p-6 relative settings-section-card settings-section-account">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">Account Actions</h2>
              <p className="text-sm text-white/60">Manage your account</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Sign out of your account. You can sign back in at any time.
            </p>
            {showLogoutConfirm ? (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Are you sure you want to sign out?</p>
                    <p className="text-xs text-white/60">You'll need to sign in again to access your account.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500/70 font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    Confirm Sign Out
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="btn-glass px-6 py-3 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn-glass px-6 py-3 rounded-lg font-semibold hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
