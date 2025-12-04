"use client";

import React from "react";
import { useInView, UseInViewOptions } from "@/hooks/useInView";

type Direction = "up" | "down" | "left" | "right";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  direction?: Direction;
  inViewOptions?: UseInViewOptions;
}

export function ScrollReveal({
  children,
  delayMs = 0,
  direction = "up",
  inViewOptions,
  className = "",
  ...rest
}: ScrollRevealProps) {
  const { ref, isInView } = useInView(inViewOptions);

  const baseTransform =
    direction === "up"
      ? "translate-y-6"
      : direction === "down"
      ? "-translate-y-6"
      : direction === "left"
      ? "translate-x-6"
      : "-translate-x-6";

  const visibleClasses = "opacity-100 translate-x-0 translate-y-0";
  const hiddenClasses = `opacity-0 ${baseTransform}`;

  // Slightly slower, smoother animation so sections ease in more gradually
  const transitionClasses = "transition-all duration-900 ease-out will-change-transform will-change-opacity";

  const style: React.CSSProperties = {
    transitionDelay: `${delayMs}ms`,
  };

  return (
    <div
      ref={ref as any}
      className={`${transitionClasses} ${isInView ? visibleClasses : hiddenClasses} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}


