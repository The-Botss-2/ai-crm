'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

type TeamRoleContextType = {
    role: string | null;
    agent: string | null;
    teamName: string | null;
    logo: string | null;
    loading: boolean;
};

const TeamRoleContext = createContext<TeamRoleContextType>({
    role: null,
    agent: null,
    loading: true,
    logo: null,
    teamName: null
});

export const useTeamRole = () => useContext(TeamRoleContext);

export function TeamRoleProvider({
    userId,
    teamId,
    children,
}: {
    userId: string;
    teamId: string;
    children: React.ReactNode;
}) {
    const { data, isLoading } = useSWR(`/api/team?id=${teamId}`, fetcher);
    const [role, setRole] = useState<string | null>(null);
    const [agent, setAgent] = useState<string | null>(null);
    const [logo, setLogo] = useState<string | null>(null);
    const [teamName, setTeamName] = useState<string | null>(null);

console.log(data, 'data ==> team');

    useEffect(() => {
        if (data?.team && userId) {
            const member = data.team.members.find((m: any) => m.profile._id === userId);
            setRole(member?.role ?? null);
            setAgent(data.team.agent)
            setLogo(data.team.logo)
            setTeamName(data.team.name)
        }
    }, [data, userId]);

    return (
        <TeamRoleContext.Provider value={{ role, agent, teamName, logo, loading: isLoading }}>
            {children}
        </TeamRoleContext.Provider>
    );
}
