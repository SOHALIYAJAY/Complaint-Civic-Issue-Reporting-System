'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ComplaintMapProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  latitude?: number
  longitude?: number
}

export default function ComplaintMap({ onLocationSelect, latitude, longitude }: ComplaintMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const marker = useRef<L.Marker | null>(null)
  const mapReadyRef = useRef(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    try {
      // Fix for marker icons in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Initialize map
      map.current = L.map(mapContainer.current).setView([22.3072, 73.1812], 13) // Default to Ahmedabad
      mapReadyRef.current = true

      // Add map tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current)

      // Add click listener to set marker
      map.current.on('click', (e) => {
        if (!map.current || !mapReadyRef.current) return
        
        const { lat, lng } = e.latlng

        // Remove old marker
        if (marker.current) {
          marker.current.remove()
        }

        // Add new marker
        marker.current = L.marker([lat, lng])
          .addTo(map.current!)
          .bindPopup(`<b>Selected Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
          .openPopup()

        // Get address from coordinates (reverse geocoding)
        getAddressFromCoordinates(lat, lng)

        // Call callback with location
        if (onLocationSelect) {
          getAddressFromCoordinates(lat, lng, onLocationSelect)
        }
      })
    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      // Cleanup on unmount
      if (map.current && mapReadyRef.current) {
        try {
          map.current.remove()
          map.current = null
          mapReadyRef.current = false
        } catch (e) {
          console.error('Error cleaning up map:', e)
        }
      }
    }
  }, []) // Empty dependency - only initialize on mount

  // Separate effect for updating marker when latitude/longitude change
  useEffect(() => {
    if (!map.current || !mapReadyRef.current || !latitude || !longitude) return

    try {
      // Remove old marker
      if (marker.current) {
        marker.current.remove()
      }

      // Add new marker with initial coordinates
      marker.current = L.marker([latitude, longitude])
        .addTo(map.current)
        .bindPopup(`<b>Current Location</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`)
        .openPopup()

      map.current.setView([latitude, longitude], 15)
    } catch (error) {
      console.error('Error updating marker:', error)
    }
  }, [latitude, longitude])

  const getAddressFromCoordinates = async (
    lat: number,
    lng: number,
    callback?: (lat: number, lng: number, address: string) => void
  ) => {
    try {
      const response = await fetch(
        `/api/geocode?lat=${lat}&lng=${lng}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const address = data.address?.road
        ? `${data.address.road}, ${data.address.city || data.address.town || ''}`
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`

      if (callback) {
        callback(lat, lng, address)
      }
    } catch (error) {
      console.error('Error getting address:', error)
      // Fallback to coordinates if address lookup fails
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      if (callback) {
        callback(lat, lng, fallbackAddress)
      }
    }
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    if (!map.current || !mapReadyRef.current) {
      alert('Map is not ready yet. Please try again in a moment.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords

        // Verify map is still valid before using it
        if (!map.current || !mapReadyRef.current || !map.current.getContainer()) {
          console.error('Map is no longer available')
          return
        }

        try {
          map.current.setView([lat, lng], 15)

          // Remove old marker
          if (marker.current) {
            marker.current.remove()
          }

          // Add new marker
          marker.current = L.marker([lat, lng])
            .addTo(map.current)
            .bindPopup(`<b>Your Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
            .openPopup()

          // Get address and trigger callback
          getAddressFromCoordinates(lat, lng, onLocationSelect)
        } catch (error) {
          console.error('Error setting view or adding marker:', error)
          alert('Error updating map location')
        }
      },
      (error) => {
        alert(`Error getting location: ${error.message}`)
      }
    )
  }

  return (
    <div className="space-y-4">
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 1 }}
      />
      <button
        type="button"
        onClick={getUserLocation}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
      >
        📍 Use My Current Location
      </button>
    </div>
  )
}
