"use client";

import { useEffect, useState } from "react";

interface LoadingProgressCardProps {
  message: string;
  platform?: "tiktok" | "instagram" | "youtube";
}

type ProgressStep = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const steps: ProgressStep[] = [
  {
    id: "fetching",
    label: "Fetching Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "rgba(20, 184, 166, 0.6)",
  },
  {
    id: "analyzing",
    label: "Analyzing Videos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "rgba(6, 182, 212, 0.6)",
  },
  {
    id: "calculating",
    label: "Calculating Metrics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "rgba(20, 184, 166, 0.6)",
  },
];

export default function LoadingProgressCard({ message, platform = "tiktok" }: LoadingProgressCardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Determine active step based on message
  useEffect(() => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("starting") || lowerMessage.includes("initializing") || lowerMessage.includes("fetching")) {
      setActiveStep(0);
    } else if (lowerMessage.includes("analyzing") || lowerMessage.includes("still analyzing")) {
      setActiveStep(1);
      setCompletedSteps(new Set(["fetching"]));
    } else if (lowerMessage.includes("calculating") || lowerMessage.includes("complete") || lowerMessage.includes("redirecting")) {
      setActiveStep(2);
      setCompletedSteps(new Set(["fetching", "analyzing"]));
    }
  }, [message]);

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(steps[stepIndex].id)) {
      return "completed";
    }
    if (stepIndex === activeStep) {
      return "active";
    }
    if (stepIndex < activeStep) {
      return "completed";
    }
    return "pending";
  };

  return (
    <div className="card-modern p-8 mb-6 animate-fadeIn relative overflow-hidden">
      {/* Animated background gradient orb */}
      <div 
        className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full opacity-30 pointer-events-none animate-gradientPulse"
        style={{
          background: `radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 70%)`,
        }}
      />
      <div 
        className="absolute -bottom-1/2 -left-1/2 w-80 h-80 rounded-full opacity-20 pointer-events-none animate-gradientPulse"
        style={{
          background: `radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(20, 184, 166, 0.2) 50%, transparent 70%)`,
          animationDelay: "1.5s",
        }}
      />

      {/* Border glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none animate-glowIntensity"
        style={{
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {/* Enhanced Spinner */}
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full border-4 border-transparent animate-spin"
              style={{
                borderTopColor: "rgba(20, 184, 166, 0.6)",
                borderRightColor: "rgba(6, 182, 212, 0.6)",
                borderBottomColor: "rgba(20, 184, 166, 0.3)",
                borderLeftColor: "rgba(6, 182, 212, 0.3)",
                filter: "drop-shadow(0 0 20px rgba(20, 184, 166, 0.4))",
              }}
            />
            <div 
              className="absolute inset-0 rounded-full animate-pulseGlow"
              style={{
                background: "radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)",
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">
              {platform === "instagram" ? "Analyzing Instagram Profile" :
               platform === "youtube" ? "Analyzing YouTube Channel" :
               "Analyzing TikTok Profile"}
            </h3>
            <p className="text-sm text-teal-400">{message}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
            {/* Animated gradient background */}
            <div 
              className="absolute inset-0 animate-progressShimmer"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.3), rgba(6, 182, 212, 0.3), rgba(20, 184, 166, 0.3), transparent)",
                backgroundSize: "200% 100%",
              }}
            />
            {/* Progress fill */}
            <div 
              className="h-full rounded-full relative overflow-hidden transition-all duration-500"
              style={{
                width: `${((activeStep + 1) / steps.length) * 100}%`,
                background: "linear-gradient(90deg, rgba(20, 184, 166, 0.8) 0%, rgba(6, 182, 212, 0.8) 50%, rgba(20, 184, 166, 0.8) 100%)",
                boxShadow: "0 0 20px rgba(20, 184, 166, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Shimmer effect on progress bar */}
              <div 
                className="absolute inset-0 animate-progressShimmer"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isActive = status === "active";
            const isCompleted = status === "completed";

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-teal-500/10" : "bg-white/5"
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-teal-500/20 border-2 border-teal-400"
                      : isActive
                      ? "bg-cyan-500/20 border-2 border-cyan-400 animate-stepPulse"
                      : "bg-white/5 border-2 border-white/10"
                  }`}
                  style={{
                    color: isCompleted || isActive ? step.color : "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-teal-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        strokeDasharray: 24,
                        strokeDashoffset: 24,
                        animation: "checkmarkDraw 0.5s ease-out forwards",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                {/* Step Label */}
                <p
                  className={`text-xs font-medium text-center transition-colors duration-300 ${
                    isActive ? "text-teal-400" : isCompleted ? "text-teal-400/80" : "text-white/40"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

