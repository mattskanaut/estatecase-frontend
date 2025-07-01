'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface SimpleGoogleMapProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

let googleMapsLoader: Loader | null = null;
let isLoading = false;
let isLoaded = false;

export default function SimpleGoogleMap({ coordinates, address, className = '' }: SimpleGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let map: google.maps.Map | null = null;
    let marker: google.maps.Marker | null = null;
    let mounted = true;

    const loadGoogleMaps = async () => {
      try {
        // Initialize loader only once
        if (!googleMapsLoader && !isLoading && !isLoaded) {
          isLoading = true;
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            setError('Google Maps API key not configured');
            return;
          }

          googleMapsLoader = new Loader({
            apiKey,
            version: 'weekly',
          });
        }

        // Load Google Maps if not already loaded
        if (!isLoaded && googleMapsLoader) {
          await googleMapsLoader.load();
          isLoaded = true;
          isLoading = false;
        }

        // Create map only if component is still mounted and container exists
        if (!mounted || !mapRef.current) return;

        // Create the map
        map = new google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 16,
          disableDefaultUI: false,
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true,
        });

        // Add a marker
        marker = new google.maps.Marker({
          position: coordinates,
          map: map,
          title: address || 'Property Location',
        });

        if (mounted) {
          setMapLoaded(true);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        if (mounted) {
          setError('Failed to load map');
        }
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      mounted = false;
      
      // Clean up marker
      if (marker) {
        marker.setMap(null);
        marker = null;
      }
      
      // Clean up map
      if (map) {
        // Don't destroy the map instance, just clear references
        map = null;
      }
    };
  }, [coordinates, address]);

  if (error) {
    return (
      <div className={`bg-red-900 border border-red-700 rounded-lg p-4 ${className}`}>
        <div className="text-red-300 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-gray-800 border border-gray-600 px-2 py-1 rounded shadow text-xs font-medium text-gray-300">
          Property Location
        </div>
        <div 
          ref={mapRef}
          className="w-full h-96 rounded-lg bg-gray-700 border border-gray-600"
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Loading map...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}