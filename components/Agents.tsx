import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import AgentsTable from './AgentsTable';

export default async function Agents() {
  const session = await auth();
  if (!session || !session.user?.id) return notFound();
  
  return (
    <div>
      <AgentsTable crmUserId={session.user.id} />
    </div>
  );
}