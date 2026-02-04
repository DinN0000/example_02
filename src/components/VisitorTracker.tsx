'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    // Only track once per session
    const hasTracked = sessionStorage.getItem('visited');
    if (hasTracked) return;

    const trackVisit = async () => {
      try {
        await fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pathname: window.location.pathname,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
          }),
        });
        sessionStorage.setItem('visited', 'true');
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };

    // Small delay to not block initial render
    setTimeout(trackVisit, 1000);
  }, []);

  return null;
}
