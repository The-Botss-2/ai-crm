'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

type TeamRoleContextType = {
    role: string | null;
    loading: boolean;
};

const TeamRoleContext = createContext<TeamRoleContextType>({
    role: null,
    loading: true,
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

    useEffect(() => {
        if (data?.team && userId) {
            const member = data.team.members.find((m: any) => m.profile._id === userId);
            setRole(member?.role ?? null);
        }
    }, [data, userId]);

    return (
        <TeamRoleContext.Provider value={{ role, loading: isLoading }}>
            {children}
        </TeamRoleContext.Provider>
    );
}
