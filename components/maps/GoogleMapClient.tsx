'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapClientProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

// Store Google Maps script loading state globally
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;

const loadGoogleMapsScript = async (): Promise<void> => {
  if (isGoogleMapsLoaded) return;
  if (isGoogleMapsLoading && loadPromise) return loadPromise;

  isGoogleMapsLoading = true;
  
  loadPromise = new Promise<void>((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        resolve();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      isGoogleMapsLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
};

export default function GoogleMapClient({ coordinates, address, className = '' }: GoogleMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const streetViewContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [streetViewAvailable, setStreetViewAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (isCancelled || !mapContainerRef.current || !streetViewContainerRef.current) return;

        // Create map only if it doesn't exist
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(mapContainerRef.current, {
            center: coordinates,
            zoom: 16,
            disableDefaultUI: false,
            mapTypeControl: true,
            streetViewControl: true,
            zoomControl: true,
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
        } else {
          // Update existing map center
          mapRef.current.setCenter(coordinates);
        }

        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setPosition(coordinates);
        } else {
          markerRef.current = new google.maps.Marker({
            position: coordinates,
            map: mapRef.current,
            title: address || 'Property Location',
          });
        }

        // Initialize Street View
        const streetViewService = new google.maps.StreetViewService();
        
        streetViewService.getPanorama(
          { location: coordinates, radius: 50 },
          (data, status) => {
            if (isCancelled) return;
            
            if (status === google.maps.StreetViewStatus.OK && data) {
              setStreetViewAvailable(true);
              
              if (!panoramaRef.current && streetViewContainerRef.current) {
                const heading = data.location?.latLng ? 
                  google.maps.geometry.spherical.computeHeading(
                    data.location.latLng,
                    new google.maps.LatLng(coordinates.lat, coordinates.lng)
                  ) : 0;

                panoramaRef.current = new google.maps.StreetViewPanorama(
                  streetViewContainerRef.current,
                  {
                    position: coordinates,
                    pov: { heading, pitch: 10 },
                    addressControl: false,
                    enableCloseButton: false,
                    motionTracking: false,
                    motionTrackingControl: false
                  }
                );

                // Link map and street view
                mapRef.current?.setStreetView(panoramaRef.current);
              } else if (panoramaRef.current) {
                // Update existing panorama position
                panoramaRef.current.setPosition(coordinates);
              }
            } else {
              setStreetViewAvailable(false);
            }
          }
        );
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      // Don't clean up the map, marker, or panorama - let them persist
      // This avoids the removeChild error when React re-renders
    };
  }, [coordinates, address]);

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
        />
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
          {streetViewAvailable === false && (
            <div className="flex items-center justify-center h-full bg-gray-700 text-gray-300">
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