"use client";

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import TeamCard from './TeamCard';
import TeamSkeleton from './TeamSkeleton';


export default function TeamList({ id }: { id: string }) {
    const { data, error, isLoading, mutate } = useSWR(`/api/team/user?id=${id}`, fetcher);

    if (isLoading) return <TeamSkeleton />;
    if (error) return <p className="text-red-500">Failed to load teams.</p>;

    return (
          <div className="flex flex-wrap gap-6 justify-start p-4">
     {data?.teams?.map((team: any) => (
                <TeamCard key={team._id} team={team} userId={id} />
            ))}
        </div>
    );
}
