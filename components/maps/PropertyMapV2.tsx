'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface PropertyMapProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

// Separate map instance management
class MapManager {
  private static instances = new Map<string, google.maps.Map>();
  private static panoramas = new Map<string, google.maps.StreetViewPanorama>();

  static createMap(containerId: string, element: HTMLElement, options: google.maps.MapOptions): google.maps.Map {
    this.cleanup(containerId);
    const map = new google.maps.Map(element, options);
    this.instances.set(containerId, map);
    return map;
  }

  static createPanorama(containerId: string, element: HTMLElement, options: google.maps.StreetViewPanoramaOptions): google.maps.StreetViewPanorama {
    const panorama = new google.maps.StreetViewPanorama(element, options);
    this.panoramas.set(containerId, panorama);
    return panorama;
  }

  static cleanup(containerId: string) {
    const map = this.instances.get(containerId);
    const panorama = this.panoramas.get(containerId);

    if (panorama) {
      try {
        panorama.setVisible(false);
      } catch (e) {
        // Ignore
      }
      this.panoramas.delete(containerId);
    }

    if (map) {
      try {
        map.setStreetView(null);
      } catch (e) {
        // Ignore
      }
      this.instances.delete(containerId);
    }
  }
}

export default function PropertyMapV2({ coordinates, address, className = '' }: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const streetViewContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const componentIdRef = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);
  const isInitializedRef = useRef(false);

  const initializeMap = useCallback(async () => {
    if (isInitializedRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
      return;
    }

    if (!mapContainerRef.current || !streetViewContainerRef.current) return;

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['geometry', 'marker']
      });

      await loader.load();
      
      if (!mapContainerRef.current || !streetViewContainerRef.current) return;

      const componentId = componentIdRef.current;
      
      // Create map
      const map = MapManager.createMap(componentId, mapContainerRef.current, {
        center: coordinates,
        zoom: 16,
      });

      // Add marker
      try {
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          new google.maps.marker.AdvancedMarkerElement({
            position: coordinates,
            map: map,
            title: address || 'Property Location'
          });
        } else {
          new google.maps.Marker({
            position: coordinates,
            map: map,
            title: address || 'Property Location'
          });
        }
      } catch (err) {
        console.warn('Marker creation failed:', err);
      }

      // Set up Street View
      const streetViewService = new google.maps.StreetViewService();
      
      streetViewService.getPanorama(
        { location: coordinates, radius: 50 },
        (streetViewPanoramaData, status) => {
          if (!streetViewContainerRef.current) return;

          if (status === google.maps.StreetViewStatus.OK && streetViewPanoramaData) {
            const camCoords = streetViewPanoramaData.location?.latLng;
            if (camCoords) {
              const heading = google.maps.geometry.spherical.computeHeading(
                camCoords,
                coordinates
              );

              try {
                const panorama = MapManager.createPanorama(componentId, streetViewContainerRef.current, {
                  position: coordinates,
                  pov: { heading: heading, pitch: 10 },
                  addressControl: false,
                  enableCloseButton: false,
                });

                map.setStreetView(panorama);
              } catch (err) {
                console.warn('Street View creation failed:', err);
                streetViewContainerRef.current.innerHTML = `
                  <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                    <div class="text-center">
                      <div class="text-sm">Street View unavailable</div>
                      <div class="text-xs mt-1">Technical issue</div>
                    </div>
                  </div>
                `;
              }
            }
          } else {
            streetViewContainerRef.current.innerHTML = `
              <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                <div class="text-center">
                  <div class="text-sm">Street View not available</div>
                  <div class="text-xs mt-1">for this location</div>
                </div>
              </div>
            `;
          }
        }
      );

      isInitializedRef.current = true;
      setIsLoaded(true);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load Google Maps');
    }
  }, [coordinates, address]);

  useEffect(() => {
    initializeMap();

    return () => {
      // Cleanup on unmount
      MapManager.cleanup(componentIdRef.current);
      isInitializedRef.current = false;
    };
  }, [initializeMap]);

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
          ref={mapContainerRef} 
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
          ref={streetViewContainerRef} 
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