'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsIntegrationProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

export default function GoogleMapsIntegration({ coordinates, address, className = '' }: GoogleMapsIntegrationProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const streetViewContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streetViewNotAvailable, setStreetViewNotAvailable] = useState(false);
  
  // Refs to hold Google Maps instances
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const markerInstanceRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const isInitializingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup function that can be called safely
  const cleanup = useCallback(() => {
    // Clean up marker
    if (markerInstanceRef.current) {
      try {
        if ('setMap' in markerInstanceRef.current) {
          markerInstanceRef.current.setMap(null);
        }
      } catch (e) {
        console.warn('Error cleaning up marker:', e);
      }
      markerInstanceRef.current = null;
    }
    
    // Clean up panorama
    if (panoramaInstanceRef.current) {
      try {
        panoramaInstanceRef.current.setVisible(false);
      } catch (e) {
        console.warn('Error cleaning up panorama:', e);
      }
      panoramaInstanceRef.current = null;
    }
    
    // Clean up map
    if (mapInstanceRef.current) {
      try {
        // Remove street view link first
        mapInstanceRef.current.setStreetView(null);
      } catch (e) {
        console.warn('Error cleaning up map:', e);
      }
      mapInstanceRef.current = null;
    }
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    isMountedRef.current = true;
    
    // Early return if containers not ready or already initializing
    if (!mapContainerRef.current || !streetViewContainerRef.current || isInitializingRef.current) {
      return;
    }

    const initializeMaps = async () => {
      isInitializingRef.current = true;
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setError('Google Maps API key not configured');
        isInitializingRef.current = false;
        return;
      }

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['geometry', 'marker']
        });

        await loader.load();

        // Check if component is still mounted
        if (!isMountedRef.current || !mapContainerRef.current || !streetViewContainerRef.current) {
          isInitializingRef.current = false;
          return;
        }

        // Create map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: coordinates,
          zoom: 16,
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{ "weight": "2.00" }]
            },
            {
              "featureType": "all",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#9c9c9c" }]
            },
            {
              "featureType": "all",
              "elementType": "labels.text",
              "stylers": [{ "visibility": "on" }]
            }
          ]
        });
        
        // Store map instance only if still mounted
        if (isMountedRef.current) {
          mapInstanceRef.current = map;
        } else {
          return;
        }

        // Add marker
        try {
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: coordinates,
              map: map,
              title: address || 'Property Location'
            });
            if (isMountedRef.current) {
              markerInstanceRef.current = marker;
            }
          } else {
            const marker = new google.maps.Marker({
              position: coordinates,
              map: map,
              title: address || 'Property Location'
            });
            if (isMountedRef.current) {
              markerInstanceRef.current = marker;
            }
          }
        } catch (err) {
          console.warn('Marker creation failed:', err);
        }

        // Initialize Street View
        const streetViewService = new google.maps.StreetViewService();
        
        streetViewService.getPanorama(
          { location: coordinates, radius: 50 },
          (streetViewPanoramaData, status) => {
            // Check if component is still mounted
            if (!isMountedRef.current || !streetViewContainerRef.current) {
              return;
            }
            
            if (status === google.maps.StreetViewStatus.OK && streetViewPanoramaData) {
              const camCoords = streetViewPanoramaData.location?.latLng;
              if (camCoords) {
                const heading = google.maps.geometry.spherical.computeHeading(
                  camCoords,
                  coordinates
                );

                try {
                  const panorama = new google.maps.StreetViewPanorama(streetViewContainerRef.current, {
                    position: coordinates,
                    pov: { heading: heading, pitch: 10 },
                    addressControl: false,
                    enableCloseButton: false,
                    motionTracking: false,
                    motionTrackingControl: false
                  });
                  
                  if (isMountedRef.current) {
                    panoramaInstanceRef.current = panorama;
                    // Link map and street view
                    map.setStreetView(panorama);
                  }
                } catch (err) {
                  console.warn('Street View creation failed:', err);
                  if (isMountedRef.current) {
                    setStreetViewNotAvailable(true);
                  }
                }
              }
            } else {
              if (isMountedRef.current) {
                setStreetViewNotAvailable(true);
              }
            }
          }
        );

        if (isMountedRef.current) {
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        if (isMountedRef.current) {
          setError('Failed to load Google Maps');
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeMaps();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [coordinates, address, cleanup]);

  if (error) {
    return (
      <div className={`bg-red-900 border border-red-700 rounded-lg p-4 ${className}`}>
        <div className="text-red-300 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Map */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-gray-800 border border-gray-600 px-2 py-1 rounded shadow text-xs font-medium text-gray-300">
          Map View
        </div>
        <div 
          ref={mapContainerRef} 
          className="w-full h-64 lg:h-80 rounded-lg bg-gray-700 border border-gray-600"
        >
          {!isLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Loading map...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Street View */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-gray-800 border border-gray-600 px-2 py-1 rounded shadow text-xs font-medium text-gray-300">
          Street View
        </div>
        <div 
          ref={streetViewContainerRef} 
          className="w-full h-64 lg:h-80 rounded-lg bg-gray-700 border border-gray-600"
        >
          {!isLoaded && !streetViewNotAvailable && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Loading street view...</div>
              </div>
            </div>
          )}
          {streetViewNotAvailable && (
            <div className="flex items-center justify-center h-full bg-gray-700 text-gray-300 rounded-lg">
              <div className="text-center p-4">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="text-sm font-medium">Street View not available</div>
                <div className="text-xs text-gray-400 mt-1">for this location</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}