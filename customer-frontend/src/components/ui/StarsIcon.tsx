"use client";

import { Stars } from '@solar-icons/react';

interface StarsIconProps {
  size?: number | string;
  color?: string;
  weight?: any;
  [key: string]: any;
}

export default function StarsIcon({ size = 28, color = "#318ffd", weight = "Bold", ...props }: StarsIconProps) {
  return <Stars size={size} color={color} weight={weight} {...props} />;
}
