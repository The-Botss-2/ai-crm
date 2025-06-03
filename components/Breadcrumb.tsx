'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  numberOfRoutes?: number;
  separator?: React.ReactNode;
  className?: string;
}

export default function Breadcrumb({ 
  numberOfRoutes = 2, 
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  className = ""
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Split the pathname and filter out empty strings
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // Get the last N segments based on numberOfRoutes
  const relevantSegments = pathSegments.slice(-numberOfRoutes);
  
  // Generate the breadcrumb items
  const breadcrumbItems = relevantSegments.map((segment, index) => {
    const isLast = index === relevantSegments.length - 1;
    
    // Build the href for clickable segments
    // We need to reconstruct the full path up to this segment
    const segmentIndex = pathSegments.indexOf(segment);
    const href = '/' + pathSegments.slice(0, segmentIndex + 1).join('/');
    
    // Format the display text (replace hyphens with spaces and capitalize)
    const displayText = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      text: displayText,
      href,
      isLast,
      originalSegment: segment
    };
  });

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      {breadcrumbItems.map((item, index) => (
        <div key={`${item.originalSegment}-${index}`} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 flex items-center">
              {separator}
            </span>
          )}
          
          {item.isLast ? (
            <span className="text-gray-600 font-medium">
              {item.text}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
            >
              {item.text}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}