"use client";

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import TeamCard from './TeamCard';
import TeamSkeleton from './TeamSkeleton';

interface props {
    userId: string;
    id: string;
}
export default function TeamList({ id,userId }: props) {
    const { data, error, isLoading, mutate } = useSWR(`/api/team/user?id=${userId}`, fetcher);
    if (isLoading) return <TeamSkeleton />;
    if (error) return <p className="text-red-500">Failed to load teams.</p>;

    return (
       <div className="flex flex-wrap gap-6 justify-start p-4">
  <TeamCard teams={data?.teams} userId={userId} organization_id={id} mutate={mutate}/>
</div>

    );
}
