"use client"

import { useEffect, useState } from "react"
import { reverseGeocode } from "@/lib/geocoding"

interface LocationNameProps {
  lat: number
  lng: number
  className?: string
  fallback?: string
}

export function LocationName({ lat, lng, className, fallback }: LocationNameProps) {
  const [name, setName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchName() {
      if (!lat || !lng) return
      setIsLoading(true)
      const locationName = await reverseGeocode(lat, lng)
      setName(locationName)
      setIsLoading(false)
    }
    fetchName()
  }, [lat, lng])

  if (isLoading) {
    return (
      <span className={`inline-block w-24 h-4 bg-slate-100 animate-pulse rounded ${className}`} />
    )
  }

  return (
    <span className={className}>
      {name || fallback || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
    </span>
  )
}
