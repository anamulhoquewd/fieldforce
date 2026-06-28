"use client"

import { useEffect, useRef } from "react"


interface TaskMapProps {
  coordinates: [number, number]
  title: string
}

export function TaskMap({ coordinates, title }: TaskMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerInstance = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return
      if (typeof google === "undefined" || !google.maps) return

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: coordinates[0], lng: coordinates[1] },
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      markerInstance.current = new google.maps.Marker({
        position: { lat: coordinates[0], lng: coordinates[1] },
        map: mapInstance.current,
        title,
      })
    }

    if (typeof google !== "undefined" && google.maps) {
      initMap()
    } else {
      window.addEventListener("google-maps-loaded", initMap)
      return () => window.removeEventListener("google-maps-loaded", initMap)
    }
  }, [coordinates, title])

  // Update marker/center when coordinates change after init
  useEffect(() => {
    if (!mapInstance.current || !markerInstance.current) return
    const pos = { lat: coordinates[0], lng: coordinates[1] }
    mapInstance.current.setCenter(pos)
    markerInstance.current.setPosition(pos)
  }, [coordinates])

  return (
    <div className="relative h-full w-full bg-muted">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
}
