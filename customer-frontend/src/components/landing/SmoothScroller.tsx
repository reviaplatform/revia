"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);
}

export default function SmoothScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Ensure we are in the browser
    if (typeof window === "undefined") return;

    // Initialize ScrollSmoother
    const smoother = ScrollSmoother.create({
      smooth: 1.5, // Balanced for premium feel without excessive lag
      effects: true,
      smoothTouch: 0.1,
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      normalizeScroll: true, // Prevents address bar jumping on mobile
      ignoreMobileResize: true,
    });

    // Refresh on any potential content changes
    ScrollTrigger.refresh();

    return () => {
      smoother.kill();
    };
  }, { scope: wrapperRef });

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
