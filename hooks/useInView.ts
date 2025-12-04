import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number;
}

export function useInView({ rootMargin = "0px 0px -15% 0px", threshold = 0.1 }: UseInViewOptions = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: immediately show content in non-browser environments
      setIsInView(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    const node = ref.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return { ref, isInView };
}


