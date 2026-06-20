"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useGSAP } from '@gsap/react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

interface SparkleStarsProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function SparkleStars({ size = 24, color = "currentColor", className = "" }: SparkleStarsProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!svgRef.current) return;

    const paths = svgRef.current.querySelectorAll('path');
    
    gsap.fromTo(paths, 
      { drawSVG: "0%" },
      {
        drawSVG: "100%",
        duration: 1.5,
        stagger: 0.2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: svgRef.current,
          start: "top 90%",
        }
      }
    );
  }, { scope: svgRef });

  return (
    <svg 
      ref={svgRef}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Recreating the Solar Stars icon structure with individual paths for animation */}
      <path 
        d="M12 4L13.09 7.26L16.5 7.77L14 10.14L14.59 13.5L12 11.77L9.41 13.5L10 10.14L7.5 7.77L10.91 7.26L12 4Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M19 14L19.55 15.63L21.25 15.89L20 17.07L20.3 18.75L19 17.89L17.7 18.75L18 17.07L16.75 15.89L18.45 15.63L19 14Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.6"
      />
      <path 
        d="M5 16L5.55 17.63L7.25 17.89L6 19.07L6.3 20.75L5 19.89L3.7 20.75L4 19.07L2.75 17.89L4.45 17.63L5 16Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.8"
      />
    </svg>
  );
}
