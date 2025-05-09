'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function RouteLoader() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    // Detect route change
    if (prevPath.current !== pathname) {
      // Show loader toast
      if (!toastId.current) {
        toastId.current = toast.loading('Loading...');
      }

      // Simulate load complete after a short delay
      const timeout = setTimeout(() => {
        if (toastId.current) {
          toast.dismiss(toastId.current);
          toastId.current = null;
        }
      }, 800); // You can increase for slow networks

      // Update previous path
      prevPath.current = pathname;

      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  return null;
}
