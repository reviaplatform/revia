"use client"

import React, { useRef } from "react"
import { gsap } from "gsap"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { useGSAP } from "@gsap/react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(MorphSVGPlugin)
}

interface MorphingSpinnerProps {
  size?: number
  color?: string
  duration?: number
}

export const MorphingSpinner: React.FC<MorphingSpinnerProps> = ({
  size = 32,
  color = "currentColor",
  duration = 1,
}) => {
  const scope = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  // Predefined premium shapes for morphing
  const shapes = {
    circle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    speech: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9z",
    rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-2.91a2.18 2.18 0 0 0-3.09-.09zm15-15C15.09 3.01 12 8 12 8l-5.5 5.5s-.84-.71-1.68-.71c-.84 0-1.5.31-1.5 1.5l2.5 2.5s.31-.66 1.5-1.5c1.19-.84 1.5-1.5 1.5-1.5L14.32 7.78C14.32 7.78 19 4.68 20.5 1.5z"
  }

  useGSAP(() => {
    if (!pathRef.current) return

    const tl = gsap.timeline({ 
      repeat: -1,
      defaults: {
        duration: duration,
        ease: "power2.inOut"
      }
    })

    // Morphing Sequence
    tl.to(pathRef.current, { morphSVG: shapes.speech })
      .to(pathRef.current, { morphSVG: shapes.zap, delay: 0.1 })
      .to(pathRef.current, { morphSVG: shapes.rocket, delay: 0.1 })
      .to(pathRef.current, { morphSVG: shapes.circle, delay: 0.1 })

    // Continuous Rotation
    gsap.to(scope.current, {
      rotate: 360,
      duration: duration * 4,
      repeat: -1,
      ease: "none"
    })

    // Pulse effect
    gsap.to(scope.current, {
      scale: 1.1,
      duration: duration * 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })
  }, { scope })

  return (
    <svg
      ref={scope}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
    >
      <path ref={pathRef} d={shapes.circle} />
    </svg>
  )
}
