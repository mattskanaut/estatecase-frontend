'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface PropertyMapProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

export default function PropertyMap({ coordinates, address, className = '' }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    const initializeMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setError('Google Maps API key not configured');
        return;
      }

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['geometry', 'marker']
        });

        await loader.load();
        
        if (!isMountedRef.current || !mapRef.current || !streetViewRef.current) return;

        // Create the map
        const map = new google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 16,
        });
        mapInstanceRef.current = map;

        // Add marker for the property (using modern AdvancedMarkerElement)
        try {
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            // Use modern AdvancedMarkerElement
            new google.maps.marker.AdvancedMarkerElement({
              position: coordinates,
              map: map,
              title: address || 'Property Location'
            });
          } else {
            // Fallback to legacy Marker if AdvancedMarkerElement not available
            new google.maps.Marker({
              position: coordinates,
              map: map,
              title: address || 'Property Location'
            });
          }
        } catch (err) {
          console.warn('Marker creation failed:', err);
          // Try legacy marker as fallback
          try {
            new google.maps.Marker({
              position: coordinates,
              map: map,
              title: address || 'Property Location'
            });
          } catch (fallbackErr) {
            console.warn('Legacy marker also failed:', fallbackErr);
          }
        }

        // Set up Street View
        const streetViewService = new google.maps.StreetViewService();
        const streetViewMaxDistance = 50;

        // Add safety check and better error handling for Street View
        try {
          streetViewService.getPanorama(
            { location: coordinates, radius: streetViewMaxDistance },
            (streetViewPanoramaData, status) => {
              // Safety check: ensure component is still mounted
              if (!isMountedRef.current || !streetViewRef.current) {
                return;
              }

              if (status === google.maps.StreetViewStatus.OK && streetViewPanoramaData) {
                const camCoords = streetViewPanoramaData.location?.latLng;
                if (camCoords) {
                  // Calculate heading from street view camera to property
                  const heading = google.maps.geometry.spherical.computeHeading(
                    camCoords,
                    coordinates
                  );

                  // Create Street View panorama with enhanced error handling
                  try {
                    // Clear any existing content first
                    streetViewRef.current.innerHTML = '';
                    
                    const panorama = new google.maps.StreetViewPanorama(
                      streetViewRef.current,
                      {
                        position: coordinates,
                        pov: {
                          heading: heading,
                          pitch: 10,
                        },
                        // Add additional safety options
                        addressControl: false,
                        enableCloseButton: false,
                      }
                    );
                    panoramaInstanceRef.current = panorama;

                    // Link map and street view with error handling
                    try {
                      map.setStreetView(panorama);
                    } catch (linkErr) {
                      console.warn('Failed to link map and street view:', linkErr);
                    }
                  } catch (err) {
                    console.warn('Street View panorama creation failed:', err);
                    if (isMountedRef.current && streetViewRef.current) {
                      streetViewRef.current.innerHTML = `
                        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                          <div class="text-center">
                            <div class="text-sm">Street View unavailable</div>
                            <div class="text-xs mt-1">Technical issue</div>
                          </div>
                        </div>
                      `;
                    }
                  }
                }
              } else {
              // Street view not available
              if (isMountedRef.current && streetViewRef.current) {
                streetViewRef.current.innerHTML = `
                  <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                    <div class="text-center">
                      <div class="text-sm">Street View not available</div>
                      <div class="text-xs mt-1">for this location</div>
                    </div>
                  </div>
                `;
              }
            }
          }
        );
        } catch (err) {
          console.warn('Street View service failed:', err);
        }

        if (isMountedRef.current) {
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clear any pending timeouts
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      // Defer cleanup to avoid React DOM conflicts
      cleanupTimeoutRef.current = setTimeout(() => {
        // Clean up Google Maps instances
        if (panoramaInstanceRef.current) {
          try {
            panoramaInstanceRef.current.setVisible(false);
            panoramaInstanceRef.current = null;
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.setStreetView(null);
            mapInstanceRef.current = null;
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        // Clear DOM elements safely - check if they still exist
        if (mapRef.current && mapRef.current.parentNode) {
          try {
            mapRef.current.innerHTML = '';
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        if (streetViewRef.current && streetViewRef.current.parentNode) {
          try {
            streetViewRef.current.innerHTML = '';
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }, 0);
    };
  }, [coordinates, address]);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-700 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Map */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-white px-2 py-1 rounded shadow text-xs font-medium">
          Map View
        </div>
        <div 
          ref={mapRef} 
          className="w-full h-64 lg:h-80 rounded-lg bg-gray-100"
        >
          {!isLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Loading map...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Street View */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-white px-2 py-1 rounded shadow text-xs font-medium">
          Street View
        </div>
        <div 
          ref={streetViewRef} 
          className="w-full h-64 lg:h-80 rounded-lg bg-gray-100"
        >
          {!isLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Loading street view...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}