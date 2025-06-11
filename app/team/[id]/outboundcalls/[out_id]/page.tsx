import { auth } from '@/auth';
import SingleCampaign from '@/components/SingleCampaign';
import { redirect } from 'next/navigation';

export default async function page({params}:{params:Promise<{id:string, out_id:string}>}) {
  const {id,out_id} = await params
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin'); 
  }
  return (
    <div className="h-screen p-4">
        <div className="flex justify-between items-center mb-4 border-b p-3 pb-4">
        <h1 className="text-2xl font-bold">Campaign Details</h1>
      </div>
      <SingleCampaign teamId={id} out_id={out_id} userID={session?.user?.id} />
    </div>
  );
}
