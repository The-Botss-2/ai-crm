// app/teams/[id]/page.tsx (server component)
import { auth } from '@/auth';
import TeamPageClient from '@/components/TeamPageClient';

export default async function TeamPage() {
  const session = await auth();

  return (
    <TeamPageClient currentUserId={session?.user?.id ?? ''} />
  );
}
