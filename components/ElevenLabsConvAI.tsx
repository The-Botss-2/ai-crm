'use client'

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const ElevenLabsWidget = ({ agent_id }: { agent_id: string }) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadScript = async () => {
      const existingScript = document.querySelector(
        'script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]'
      );
      if (existingScript) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        setScriptLoaded(true);
      };

      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (isLoading) {
      // Show loading toast when component starts loading
      toast.loading('Loading AI Assistant...', {
        id: 'elevenlabs-loading',
        duration: Infinity, // Keep it until we dismiss it
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (scriptLoaded && widgetRef.current && !widgetRef.current.hasChildNodes()) {
      // Small delay to ensure script is fully initialized
      setTimeout(() => {
        if (widgetRef.current) {
          const convaiElement = document.createElement('elevenlabs-convai');
          convaiElement.setAttribute('agent-id', agent_id);
          widgetRef.current.appendChild(convaiElement);
          setIsLoading(false);
          // Dismiss loading toast and show success
          toast.dismiss('elevenlabs-loading');
          toast.success('AI Assistant ready!');
        }
      }, 500);
    }
  }, [scriptLoaded]);

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div>        
        <div 
          ref={widgetRef} 
          className="w-full h-full rounded-lg overflow-hidden"
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};

export default ElevenLabsWidget;