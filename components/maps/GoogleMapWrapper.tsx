'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const GoogleMapClient = dynamic(() => import('./GoogleMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-700 rounded-lg">
      <div className="text-center text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <div className="text-sm">Loading map...</div>
      </div>
    </div>
  ),
});

interface GoogleMapWrapperProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  className?: string;
}

export default function GoogleMapWrapper(props: GoogleMapWrapperProps) {
  return <GoogleMapClient {...props} />;
}