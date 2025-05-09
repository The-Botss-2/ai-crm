'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';
import TeamMembersTable from '@/components/TeamMembersTable';
import AddMemberDialog from '@/components/AddMemberDialog';

export default function TeamPageClient({ currentUserId }: { currentUserId: string }) {
  const { id } = useParams();
  const { data, error, mutate } = useSWR(`/api/team?id=${id}`, fetcher);

  if (error) return <div className="text-red-500">Failed to load team</div>;
  if (!data) return <div>Loading...</div>;

  const { team } = data;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-5">
        <h1 className="text-xl font-semibold">Team - {team.name}</h1>
        {team.createdBy === currentUserId && (
          <AddMemberDialog teamId={team._id} requesterId={currentUserId} mutate={mutate} />
        )}
      </div>

      <TeamMembersTable
        members={team.members}
        isAdmin={team.createdBy === currentUserId}
        teamId={team._id}
        requesterId={currentUserId}
        mutate={mutate}
      />
    </div>
  );
}
