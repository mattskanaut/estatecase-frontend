'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface GoogleMapsContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function GoogleMapsContainer({ children, className = '' }: GoogleMapsContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a detached DOM element for Google Maps
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.style.width = '100%';
      portalRef.current.style.height = '100%';
    }

    // Append to container when ready
    if (containerRef.current && portalRef.current) {
      containerRef.current.appendChild(portalRef.current);
    }

    return () => {
      // Clean up portal
      if (portalRef.current && portalRef.current.parentNode) {
        portalRef.current.parentNode.removeChild(portalRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {portalRef.current && createPortal(children, portalRef.current)}
    </div>
  );
}