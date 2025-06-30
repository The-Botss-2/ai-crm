'use client';

import { BiLogoZoom } from 'react-icons/bi';
import ZoomPanel from './ZoomPanel';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { zoomFetcher } from '@/lib/zoomFetcher';
import toast from 'react-hot-toast';

interface ZoomCardProps {
  isConnected: boolean;
  zoomUserId?: string;
  onConnect: () => void;
}

export function ZoomCard({ isConnected, zoomUserId, onConnect }: ZoomCardProps) {
  const [showPanel, setShowPanel] = useState(false);

  const {
    data: meetingData,
    error: meetingError,
    isLoading: loadingMeeting,
  } = useSWR(
    isConnected && zoomUserId ? `/start_meeting/${zoomUserId}` : null,
    zoomFetcher,
    {
      onError: () => toast.error('Failed to fetch Zoom meeting.'),
      revalidateOnFocus: false,
    }
  );

  const meetingUrl = meetingData?.start_url || null;

  return (
    <>
      <div className="bg-white/50 border-gray-200 rounded-xl py-8 flex gap-3 flex-col items-center justify-center shadow-md hover:shadow-lg transition">
        <div>
          <div className="size-10 bg-[#0871f4] rounded-full p-2 flex mb-2 items-center justify-center">
            <BiLogoZoom color="white" size={20} />
          </div>
          <h2 className="text-sm font-semibold">Zoom</h2>
        </div>

        {isConnected ? (
          <>
            <p className="text-green-700 text-xs">Zoom account connected</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPanel(true)}
                className="bg-blue-100 w-28 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs"
              >
                Setup
              </button>

              {meetingUrl ? (
                <Link
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-100 w-28 text-center text-green-800 px-4 py-2 rounded hover:font-semibold text-xs"
                >
                  Start Meeting
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-gray-100 w-28 text-gray-500 px-4 py-2 rounded text-xs cursor-not-allowed"
                >
                  {loadingMeeting ? 'Loading...' : 'Start Meeting'}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-xs">No Zoom account found.</p>
            <button
              onClick={onConnect}
              className="bg-blue-100 text-blue-800 text-xs px-4 py-2 rounded-sm hover:font-semibold"
            >
              Connect
            </button>
          </>
        )}
      </div>

      {isConnected && zoomUserId && (
        <ZoomPanel
          isOpen={showPanel}
          zoomUserId={zoomUserId}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}


export function ZoomCardSkeleton() {
  return (
    <div className="bg-white/40 border  border-gray-200 rounded-xl py-6 px-4 flex gap-3 flex-col items-center justify-center shadow-md animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="size-10 bg-gray-300 rounded-full flex items-center justify-center">
          <BiLogoZoom color="white" size={20} />
        </div>
        <div className="h-4 w-20 bg-gray-300 rounded" />
      </div>
      <div className="h-3 w-32 bg-gray-300 rounded" />
      <div className="h-6 w-20 bg-gray-300 rounded" />
    </div>
  );
}