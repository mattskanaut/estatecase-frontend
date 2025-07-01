'use client';

import { useState } from 'react';
import GoogleMapsIntegration from './GoogleMapsIntegration';
import SimpleLocationDisplay from './SimpleLocationDisplay';

interface LocationDisplayProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

export default function LocationDisplay({ coordinates, address, className = '' }: LocationDisplayProps) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  const [mapsError, setMapsError] = useState(false);

  const handleMapsError = () => {
    setMapsError(true);
    setUseGoogleMaps(false);
  };

  return (
    <div className={className}>
      {/* Toggle Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseGoogleMaps(true)}
            disabled={mapsError}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              useGoogleMaps && !mapsError
                ? 'bg-blue-600 text-white'
                : mapsError
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Interactive Maps
          </button>
          <button
            onClick={() => setUseGoogleMaps(false)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              !useGoogleMaps
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            External Links
          </button>
        </div>
        
        {mapsError && (
          <div className="text-xs text-red-400">
            Maps unavailable
          </div>
        )}
      </div>

      {/* Content */}
      {useGoogleMaps && !mapsError ? (
        <div>
          <GoogleMapsIntegration
            coordinates={coordinates}
            address={address}
            onError={handleMapsError}
          />
        </div>
      ) : (
        <SimpleLocationDisplay
          coordinates={coordinates}
          address={address}
        />
      )}
    </div>
  );
}