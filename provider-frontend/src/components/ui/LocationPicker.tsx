"use client"

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

interface LocationPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
  disabled?: boolean
}

// Internal component to handle map events
function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({
  initialLat = 30.0444,
  initialLng = 31.2357,
  onLocationSelect,
  disabled = false
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng])
    }
  }, [initialLat, initialLng])

  const handleSelect = (lat: number, lng: number) => {
    if (disabled) return
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  if (!mounted) return <div className="h-64 bg-slate-100 rounded-wf-lg animate-pulse" />

  return (
    <div className="relative h-64 w-full rounded-wf-lg overflow-hidden border border-slate-200">
      <MapContainer 
        key={`${position[0]}-${position[1]}`}
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={!disabled}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        {!disabled && <MapEvents onLocationSelect={handleSelect} />}
      </MapContainer>
    </div>
  )
}
