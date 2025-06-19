'use client'

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const ElevenLabsWidget = ({ agent_id }: { agent_id: string }) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper functions for color and variant
  function updateWidgetVariant(widget: HTMLElement) {
    const isMobile = window.innerWidth <= 640;
    widget.setAttribute('variant', isMobile ? 'compact' : 'tiny');
  }
  function updateWidgetColors(widget: HTMLElement) {
    const isDarkMode = !document.documentElement.classList.contains('light');
    if (isDarkMode) {
      widget.setAttribute('avatar-orb-color-1', '#2E2E2E');
      widget.setAttribute('avatar-orb-color-2', '#B8B8B8');
    } else {
      widget.setAttribute('avatar-orb-color-1', '#4D9CFF');
      widget.setAttribute('avatar-orb-color-2', '#9CE6E6');
    }
  }

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
      toast.loading('Loading AI Assistant...', {
        id: 'elevenlabs-loading',
        duration: Infinity,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (scriptLoaded && widgetRef.current && !widgetRef.current.hasChildNodes()) {
      setTimeout(() => {
        if (widgetRef.current) {
          const convaiElement = document.createElement('elevenlabs-convai');
          convaiElement.setAttribute('agent-id', agent_id);
          convaiElement.setAttribute('variant', 'tiny');
          convaiElement.setAttribute('avatar-image-url', 'https://callingagent.thebotss.com/static/1698673175383.jpeg');
          updateWidgetColors(convaiElement);
          updateWidgetVariant(convaiElement);

          // Listen for theme changes and resize events
          const observer = new MutationObserver(() => {
            updateWidgetColors(convaiElement);
          });
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
          });
          window.addEventListener('resize', () => {
            updateWidgetVariant(convaiElement);
          });

          // Add clientTools for redirection
          convaiElement.addEventListener('elevenlabs-convai:call', (event: any) => {
            event.detail.config.clientTools = {
              redirectToDocs: ({ path }: { path: string }) => {
                // @ts-ignore: next.router is not typed
                const router = (window as any)?.next?.router;
                if (router) {
                  router.push(path);
                }
              },
              redirectToEmailSupport: ({ subject, body }: { subject: string; body: string }) => {
                const encodedSubject = encodeURIComponent(subject);
                const encodedBody = encodeURIComponent(body);
                window.open(
                  `mailto:team@elevenlabs.io?subject=${encodedSubject}&body=${encodedBody}`,
                  '_blank'
                );
              },
              redirectToSupportForm: ({ subject, description, extraInfo }: { subject: string; description: string; extraInfo: string }) => {
                const baseUrl = 'https://help.elevenlabs.io/hc/en-us/requests/new';
                const ticketFormId = '13145996177937';
                const encodedSubject = encodeURIComponent(subject);
                const encodedDescription = encodeURIComponent(description);
                const encodedExtraInfo = encodeURIComponent(extraInfo);
                const fullUrl = `${baseUrl}?ticket_form_id=${ticketFormId}&tf_subject=${encodedSubject}&tf_description=${encodedDescription}%3Cbr%3E%3Cbr%3E${encodedExtraInfo}`;
                window.open(fullUrl, '_blank', 'noopener,noreferrer');
              },
              redirectToExternalURL: ({ url }: { url: string }) => {
                window.location.href = url;
              },
            };
          });

          widgetRef.current.appendChild(convaiElement);
          setIsLoading(false);
          toast.dismiss('elevenlabs-loading');
          toast.success('AI Assistant ready!');
        }
      }, 500);
    }
  }, [scriptLoaded, agent_id]);

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