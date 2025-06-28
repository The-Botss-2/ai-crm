'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import SocialPanel from './SocialPanel';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useCardConnection } from '@/context/CardConnectionContext';

interface SocialCardProps {
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  userId?: string;
  onConnect: () => void;
  fetchMeetingUrl?: string; // Only for Zoom
  mutate: () => void;
}

export function SocialCard({
  name,
  icon,
  isConnected,
  userId,
  onConnect,
  fetchMeetingUrl,
  mutate
}: SocialCardProps) {
  const [showPanel, setShowPanel] = useState(false);

  const params = useParams<{ id: string }>();
  const teamId = params.id;
  const { setIsCardConnected } = useCardConnection()

  const { data: meetingData, isLoading: loadingMeeting } = useSWR(
    isConnected && name === 'Zoom' && fetchMeetingUrl ? fetchMeetingUrl : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    },
    {
      onError: () => toast.error(`Failed to fetch ${name} meeting.`),
      revalidateOnFocus: false,
    }
  );

  const meetingUrl = meetingData?.start_url || null;

  const bgColorMap: Record<string, string> = {
    Zoom: 'bg-[#0871f4]',      // Blue
    ElevenLabs: 'bg-black',    // Black
    Twilio: 'bg-orange-500',
    Email: 'bg-red-900' // Orange
  };

  const disconnectEmail = async () => {
    const toastId = toast.loading('Unlinking Email...');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_CRM_EMAILS_URL}/user/unlink`, {
        user_id: userId
      })
      toast.success('Email Unlinked successfully!', { id: toastId });
      setIsCardConnected(false)
      mutate();
    } catch (error) {
      console.error('Error unlinking email:', error);
      toast.error('Failed to unlink email. Please try again.', { id: toastId });
    }
  }
useEffect(() => {
  console.log("name", name, "isConnected", isConnected);
  
  if (name === 'Email' && isConnected) {
 setIsCardConnected(true)
  }
}, [name, isConnected]);


  return (
    <>
      <div className="bg-white/50 rounded-xl py-8 flex gap-3 flex-col items-center justify-center shadow-md hover:shadow-lg transition">
        <div className="flex flex-col items-center">
          <div
            className={`size-10 ${bgColorMap[name] || 'bg-gray-400'} rounded-full p-2 flex mb-2 items-center justify-center`}
          >
            {icon}
          </div>
          <h2 className="text-sm font-semibold">{name}</h2>
        </div>

        {isConnected ? (
          <>
            <p className="text-green-700 text-xs">{name} account connected</p>
            <div className="flex gap-2">
              {name === 'Zoom' &&

                <button onClick={() => setShowPanel(true)} className="bg-blue-100 w-28 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs">
                  Setup
                </button>
              }

              {name !== 'Zoom' && name !== 'Email' && <Link href={`/integrations/${name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)}`} className="bg-blue-100 w-fit text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs">
                Setup
              </Link>}


              {
                name !== 'Zoom' && name == 'Email' && <button onClick={disconnectEmail} className="bg-blue-100 w-28 text-red-800 px-4 py-2 rounded hover:font-semibold text-xs">
                  Disconnect
                </button>
              }

              {name === 'Zoom' && fetchMeetingUrl && (
                meetingUrl ? (
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
                )
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-xs">No {name} account found.</p>
            <button
              onClick={onConnect}
              className="bg-blue-100 text-blue-800 text-xs px-4 py-2 rounded-sm hover:font-semibold"
            >
              Connect
            </button>
          </>
        )}
      </div>

      {isConnected && userId && name === 'Zoom' && (
        <SocialPanel
          isOpen={showPanel}
          userId={userId}
          onClose={() => setShowPanel(false)}
          fetchUrl={`${process.env.NEXT_PUBLIC_ZOOM_URL}/zoom/get_context/${userId}`}
          uploadUrl={`${process.env.NEXT_PUBLIC_ZOOM_URL}/zoom/upload_context`}
          label={'Zoom'}
          name={'Zoom'}
        />
      )}
    </>
  );
}

export function SocialCardSkeleton({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-6 px-4 flex flex-col items-center justify-center gap-4 shadow-sm animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="h-6 w-20 bg-gray-200 rounded" />
    </div>
  );
}
