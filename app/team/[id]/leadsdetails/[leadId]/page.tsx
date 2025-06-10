import { auth } from '@/auth';
import LeadDetails from '@/components/LeadDetails';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { leadId: string , id: string} }) {
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const { leadId,id } = await params;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 border-b p-3 pb-4">
        <h1 className="text-2xl font-bold">Lead Details</h1>
      </div>
      <LeadDetails leadId={leadId} teamId={id} userID={session?.user?.id}/>
    </div>
  );
}
