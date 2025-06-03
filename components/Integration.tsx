'use client';

import useSWR from 'swr';
import { INTEGRATIONS } from '@/utils/integrations';
import IntegrationCard from '@/components/IntegrationCard';
import { socialFetcher } from '@/lib/socialFetcher';
import { BiLogoZoom } from 'react-icons/bi';
import { SiElevenlabs, SiTwilio } from 'react-icons/si';
import { SocialCardSkeleton } from './SocialCard';
import { MdOutlineEmail } from "react-icons/md";


type Props = {
    userId: string;
};

export default function Integration({ userId }: Props) {
    const { data: status, error, isLoading, mutate } = useSWR('/api/integrations', socialFetcher);
    const icons = {
        zoom: <BiLogoZoom color="white" size={20} />,
        elevenlabs: <SiElevenlabs color="white" size={20} />,
        twilio: <SiTwilio color="white" size={20} />,
        email: <MdOutlineEmail color="white" size={20} />,
    };


    if (error) return <div>Failed to load integration status.</div>;
    if (isLoading || !status) return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">Integrations</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {INTEGRATIONS.map((integration) => <SocialCardSkeleton key={integration.name} icon={icons[integration.name]} />)}
            </div>
        </div>
    )

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">Integrations</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {INTEGRATIONS.map((integration, key) => (
                    <IntegrationCard
                        key={integration.name}
                        userId={userId}
                        name={integration.name}
                        displayName={integration.displayName}
                        oauthUrl={integration.oauthUrl}
                        statusData={status[integration.name] || { connected: false }}
                        mutate={mutate}
                    />
                ))}
            </div>
        </div>
    );
}
