'use client';

interface SimpleLocationDisplayProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

export default function SimpleLocationDisplay({ coordinates, address, className = '' }: SimpleLocationDisplayProps) {
  const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  const streetViewUrl = `https://www.google.com/maps/@${coordinates.lat},${coordinates.lng},3a,75y,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i13312!8i6656`;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Map View */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-white px-2 py-1 rounded shadow text-xs font-medium">
          Map View
        </div>
        <div className="w-full h-64 lg:h-80 rounded-lg bg-gray-100 flex flex-col items-center justify-center text-center p-6">
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-700">Location</div>
            <div className="text-xs text-gray-500 mt-1">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
            {address && (
              <div className="text-xs text-gray-600 mt-2 max-w-48">
                {address}
              </div>
            )}
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            View on Google Maps
          </a>
        </div>
      </div>

      {/* Street View */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 bg-white px-2 py-1 rounded shadow text-xs font-medium">
          Street View
        </div>
        <div className="w-full h-64 lg:h-80 rounded-lg bg-gray-100 flex flex-col items-center justify-center text-center p-6">
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-sm font-medium text-gray-700">Street View</div>
            <div className="text-xs text-gray-500 mt-1">
              Interactive street-level imagery
            </div>
          </div>
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            View Street View
          </a>
        </div>
      </div>
    </div>
  );
}