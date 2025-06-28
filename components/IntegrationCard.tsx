'use client';

import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { SocialCard } from './SocialCard';
import { BiLogoZoom } from 'react-icons/bi';
import { SiElevenlabs, SiTwilio } from 'react-icons/si';
import ConnectDialog from './ConnectDialog';
import { MdOutlineEmail } from "react-icons/md";

type Props = {
  userId: string;
  name: 'zoom' | 'elevenlabs' | 'twilio' | 'email';
  displayName: string;
  oauthUrl: string;
  statusData: {
    connected: boolean;
    [key: string]: any;
  };
  mutate: () => void;
};

export default function IntegrationCard({
  userId,
  name,
  displayName,
  oauthUrl,
  statusData,
  mutate,
}: Props) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const handleConnect = async () => {
    if (name === 'zoom') {
      try {
        const res = await axios.post(`${oauthUrl}?crm_user_id=${userId}`);
        window.open(res.data.auth_url, '_blank');
      } catch (err) {
        toast.error(`Failed to connect with ${displayName}.`);
        console.error(err);
      }
    } else {
      setShowConnectDialog(true);
    }
  };

  const icons = {
    zoom: <BiLogoZoom color="white" size={20} />,
    elevenlabs: <SiElevenlabs color="white" size={20} />,
    twilio: <SiTwilio color="white" size={20} />,
    email: <MdOutlineEmail color="white" size={20} />,
  };

  const isNotConnected = !statusData?.connected;

  return (
    <>
      {(name === 'twilio' || name === 'elevenlabs' || name === "email") && (
        <ConnectDialog
          name={name}
          isOpen={showConnectDialog}
          onClose={() => setShowConnectDialog(false)}
          crmUserId={userId}
          apiUrl={
            name === 'twilio'
              ? `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/twilio/connect`
              : name === 'elevenlabs'
                ? `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/elevenlabs/connect`
                : `${process.env.NEXT_PUBLIC_CRM_EMAILS_URL}/user/link`
          }
          fields={
            name === 'twilio'
              ? [
                { name: 'account_sid', label: 'Account SID' },
                { name: 'auth_token', label: 'Auth Token' },
              ]
              : name === 'elevenlabs'
                ? [{ name: 'api_key', label: 'API Key' }]
                : [
                  { name: 'email', label: 'Email', type: 'email' },
                  { name: 'password', label: 'Password', type: 'password' },
                ]
          }
          onSuccess={() => {
            mutate(); // 🔁 revalidate unified status
            setShowConnectDialog(false);
          }}
        />
      )}

      <SocialCard
        name={displayName}
        icon={icons[name]}
        isConnected={!isNotConnected}
        userId={userId}
        onConnect={handleConnect}
        mutate={mutate}
        fetchMeetingUrl={
          name === 'zoom' ? `${process.env.NEXT_PUBLIC_ZOOM_URL}/zoom/start_meeting/${userId}` : undefined
        }
      />
    </>
  );
}
