'use client';

import { useState, useEffect } from 'react';

// This hook is used to prevent hydration mismatches by detecting if the component has mounted on the client.
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
