'use client';

import useSWR from 'swr';
import IntegrationCard from '@/components/IntegrationCard';
import { socialFetcher } from '@/lib/socialFetcher';
import { BiLogoZoom } from 'react-icons/bi';
import { SiElevenlabs, SiTwilio } from 'react-icons/si';
import { SocialCardSkeleton } from './SocialCard';
import { MdOutlineEmail } from "react-icons/md";
import { useTeamRole } from '@/context/TeamRoleContext';
import { FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';


type Props = {
    userId: string;
    page?: string;
};

export default function Integration({ userId, page }: Props) {
    const { role } = useTeamRole();
    const router = useRouter()
    const { data: status, error, isLoading, mutate } = useSWR('/api/integrations', socialFetcher);
    const icons: any = {
        zoom: <BiLogoZoom color="white" size={20} />,
        elevenlabs: <SiElevenlabs color="white" size={20} />,
        twilio: <SiTwilio color="white" size={20} />,
        email: <MdOutlineEmail color="white" size={20} />,
    };
    const INTEGRATIONS: any = [
        ...(role === 'admin' || page === 'integrations' ? [
            {
                name: 'zoom',
                displayName: 'Zoom',
                oauthUrl: 'https://zoom.thebotss.com/zoom/oauth/start',
                fetchUrl: 'https://zoom.thebotss.com/zoom/zoom_user',
            },
            {
                name: 'elevenlabs',
                displayName: 'ElevenLabs',
                oauthUrl: 'https://callingagent.thebotss.com/api/elevenlabs/connect',
                fetchUrl: 'https://callingagent.thebotss.com/api/elevenlabs/status',
            },
            {
                name: 'twilio',
                displayName: 'Twilio',
                oauthUrl: 'https://callingagent.thebotss.com/api/twilio/connect',
                fetchUrl: 'https://callingagent.thebotss.com/api/twilio/status',
            }
        ] : []),
        {
            name: 'email',
            displayName: 'Email',
            oauthUrl: 'https://callingagent.thebotss.com/api/email/connect', // Fixed URL (assuming)
            fetchUrl: 'https://callingagent.thebotss.com/api/email/status', // Fixed URL (assuming)
        }
    ] as const;


    if (error) return <div>Failed to load integration status.</div>;
    if (isLoading || !status) return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">Integrations</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {INTEGRATIONS.map((integration: any) => <SocialCardSkeleton key={integration.name} icon={icons[integration.name]} />)}
            </div>
        </div>
    )

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">Integrations</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {INTEGRATIONS.map((integration: any, key: any) => (
                    <IntegrationCard
                        key={integration.name}
                        userId={userId}
                        name={integration.name || ''}
                        displayName={integration.displayName}
                        oauthUrl={integration.oauthUrl}
                        statusData={status[integration.name] || { connected: false }}
                        mutate={mutate}
                    />
                ))}
            </div>
            <div className="mt-6 flex justify-end">
              {page === 'integrations' ?  <button
              onClick={() => router.push(`/teams`)}
                    className="flex items-center justify-center gap-2 w-32 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md shadow-md hover:from-blue-600 hover:to-blue-800 hover:shadow-lg transition duration-200 text-sm font-medium"
                >
                    Go Next
                    <FaArrowRight className="text-sm" />
                </button>:null} 

            </div>
        </div>
    );
}
